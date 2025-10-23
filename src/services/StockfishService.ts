/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';

export interface StockfishAnalysis {
  bestMove: string;
  evaluation: number; // em centipawns
  depth: number;
  pv: string[]; // principal variation
}

interface EvaluationUpdate {
  type: 'cp' | 'mate';
  value: number;
  depth: number;
}

/**
 * Parser UCI robusto com filtragem de mensagens progressivas
 * Implementa as melhores práticas do Lichess para evitar "dancing"
 */
class UCIEvaluationParser {
  private evaluationsByDepth = new Map<number, EvaluationUpdate>();
  private lastReportedDepth = 0;

  parseInfoMessage(line: string): EvaluationUpdate | null {
    if (!line.startsWith('info')) return null;

    // Ignorar bounds incompletos - causa principal do "dancing"
    if (line.includes('lowerbound') || line.includes('upperbound')) {
      return null;
    }

    const depthMatch = line.match(/depth (\d+)/);
    if (!depthMatch) return null;

    const depth = parseInt(depthMatch[1]);

    // Parse mate score
    const mateMatch = line.match(/score mate (-?\d+)/);
    if (mateMatch) {
      const mateIn = parseInt(mateMatch[1]);
      const evaluation: EvaluationUpdate = {
        type: 'mate',
        value: mateIn > 0 ? 100000 - mateIn : -100000 + mateIn,
        depth
      };
      this.evaluationsByDepth.set(depth, evaluation);

      // Atualizar apenas a cada 3 depths para reduzir "dancing"
      if (depth % 3 === 0 || depth > this.lastReportedDepth) {
        this.lastReportedDepth = depth;
        return evaluation;
      }
      return null;
    }

    // Parse centipawns
    const cpMatch = line.match(/score cp (-?\d+)/);
    if (cpMatch) {
      const evaluation: EvaluationUpdate = {
        type: 'cp',
        value: parseInt(cpMatch[1]),
        depth
      };
      this.evaluationsByDepth.set(depth, evaluation);

      // Atualizar apenas a cada 3 depths
      if (depth % 3 === 0 || depth > this.lastReportedDepth) {
        this.lastReportedDepth = depth;
        return evaluation;
      }
      return null;
    }

    return null;
  }

  getFinalEvaluation(): EvaluationUpdate | null {
    if (this.evaluationsByDepth.size === 0) return null;
    const maxDepth = Math.max(...this.evaluationsByDepth.keys());
    return this.evaluationsByDepth.get(maxDepth) || null;
  }

  reset() {
    this.evaluationsByDepth.clear();
    this.lastReportedDepth = 0;
  }
}

/**
 * Serviço gerenciador do Stockfish com prevenção de race conditions
 * Implementa todas as otimizações recomendadas do artigo
 */
class StockfishService extends EventEmitter {
  private worker: Worker | null = null;
  private isReady = false;
  private analysisId = 0;
  private currentAnalysisId: number | null = null;
  private analysisCallbacks = new Map<number, (result: StockfishAnalysis) => void>();
  private progressCallbacks = new Map<number, (update: EvaluationUpdate) => void>();

  private parser: UCIEvaluationParser;
  private lastEvaluation = 0;
  private lastDepth = 0;
  private lastPV: string[] = [];
  private lastBestMove = '';

  private stopSupported = true;
  private messageListeners: ((e: MessageEvent) => void)[] = [];

  constructor() {
    super();
    this.parser = new UCIEvaluationParser();
    this.initEngine();
  }

  private initEngine() {
    try {
      this.worker = new Worker('/stockfish.wasm.js');

      const messageHandler = (e: MessageEvent) => {
        const message = e.data;

        // Engine ready
        if (message === 'readyok') {
          this.isReady = true;
          this.emit('ready');
          console.log('✅ Stockfish is ready!');
        }

        // Best move found
        if (message.startsWith('bestmove')) {
          this.handleBestMove(message);
        }

        // Evaluation info - parser robusto
        if (message.startsWith('info')) {
          this.handleInfo(message);
        }
      };

      this.worker.onmessage = messageHandler;
      this.messageListeners.push(messageHandler);

      this.worker.onerror = (e) => {
        console.error('❌ Stockfish worker error:', e);
      };

      // Initialize UCI
      this.send('uci');
      this.send('isready');

    } catch (error) {
      console.error('❌ Failed to initialize Stockfish:', error);
    }
  }

  private handleInfo(message: string) {
    // Parse depth para logging
    const depthMatch = message.match(/depth (\d+)/);
    if (depthMatch) {
      this.lastDepth = parseInt(depthMatch[1]);
    }

    // Parse PV
    const pvMatch = message.match(/pv (.+)/);
    if (pvMatch) {
      this.lastPV = pvMatch[1].split(' ');
    }

    // Parser robusto com filtragem
    const evaluation = this.parser.parseInfoMessage(message);

    if (evaluation && this.currentAnalysisId !== null) {
      this.lastEvaluation = evaluation.value;

      // Callback de progresso (para updates em tempo real)
      const progressCallback = this.progressCallbacks.get(this.currentAnalysisId);
      if (progressCallback) {
        progressCallback(evaluation);
      }
    }
  }

  private handleBestMove(message: string) {
    const parts = message.split(' ');
    this.lastBestMove = parts[1] || '';

    // Obter avaliação final do parser
    const finalEval = this.parser.getFinalEvaluation();

    if (finalEval) {
      this.lastEvaluation = finalEval.value;
      this.lastDepth = finalEval.depth;
    }

    // Resolver promise da análise atual
    if (this.currentAnalysisId !== null) {
      const callback = this.analysisCallbacks.get(this.currentAnalysisId);
      if (callback) {
        callback({
          bestMove: this.lastBestMove,
          evaluation: this.lastEvaluation,
          depth: this.lastDepth,
          pv: this.lastPV
        });
        this.analysisCallbacks.delete(this.currentAnalysisId);
        this.progressCallbacks.delete(this.currentAnalysisId);
      }
    }
  }

  private send(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  async waitForReady(): Promise<void> {
    if (this.isReady) return;

    return new Promise((resolve) => {
      this.once('ready', () => {
        resolve();
      });
    });
  }

  /**
   * Analisa uma posição com sistema de IDs para evitar race conditions
   * @param fen Posição em formato FEN
   * @param depth Profundidade de análise (padrão: 20)
   * @param onProgress Callback opcional para updates progressivos
   */
  async analyze(
    fen: string,
    depth: number = 20,
    onProgress?: (evaluation: number) => void
  ): Promise<StockfishAnalysis> {
    await this.waitForReady();

    // Incrementar ID de análise
    const analysisId = ++this.analysisId;
    this.currentAnalysisId = analysisId;

    // Cancelar análise anterior se existir
    if (analysisId > 1) {
      await this.stopAnalysis();
    }

    // Resetar parser
    this.parser.reset();
    this.lastDepth = 0;
    this.lastPV = [];

    return new Promise((resolve) => {
      // Registrar callbacks
      this.analysisCallbacks.set(analysisId, resolve);

      if (onProgress) {
        this.progressCallbacks.set(analysisId, (update: EvaluationUpdate) => {
          onProgress(update.value);
        });
      }

      // Enviar comandos UCI
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);

      // Timeout com cleanup
      setTimeout(() => {
        if (this.analysisCallbacks.has(analysisId)) {
          console.warn('⚠️ Analysis timeout for ID:', analysisId);
          this.analysisCallbacks.delete(analysisId);
          this.progressCallbacks.delete(analysisId);

          resolve({
            bestMove: this.lastBestMove || '',
            evaluation: this.lastEvaluation,
            depth: this.lastDepth,
            pv: this.lastPV
          });
        }
      }, 10000);
    });
  }

  /**
   * Para análise atual com fallback para terminate
   */
  private async stopAnalysis(): Promise<void> {
    if (!this.stopSupported) {
      return; // Não tenta stop se já sabemos que não funciona
    }

    return new Promise((resolve) => {
      this.send('stop');

      // Aguarda 1 segundo por bestmove
      const timeout = setTimeout(() => {
        console.warn('⚠️ Stop command não respondeu, marcando como não suportado');
        this.stopSupported = false;
        resolve();
      }, 1000);

      // Se receber bestmove, está ok
      const originalHandler = this.worker?.onmessage;
      if (this.worker) {
        this.worker.onmessage = (e) => {
          if (originalHandler) originalHandler(e);
          if (e.data.startsWith('bestmove')) {
            clearTimeout(timeout);
            resolve();
          }
        };
      }
    });
  }

  setSkillLevel(level: number) {
    // 0-20, where 0 is weakest
    this.send(`setoption name Skill Level value ${level}`);
  }

  stop() {
    this.send('stop');
  }

  /**
   * Cleanup completo do worker para evitar memory leaks
   */
  quit() {
    if (!this.worker) return;

    // Sequência completa de cleanup
    this.send('stop');

    setTimeout(() => {
      if (!this.worker) return;

      this.send('setoption name Clear Hash');
      this.send('quit');

      setTimeout(() => {
        if (!this.worker) return;

        // Remover todos os listeners explicitamente
        this.messageListeners.forEach(listener => {
          this.worker?.removeEventListener('message', listener as any);
        });
        this.messageListeners = [];

        this.worker.terminate();
        this.worker = null;
        this.isReady = false;

        console.log('✅ Stockfish worker terminado com cleanup completo');
      }, 100);
    }, 100);
  }

  /**
   * Usa ucinewgame apenas quando necessário (novo jogo, não novo movimento)
   */
  newGame() {
    this.send('ucinewgame');
    this.parser.reset();
    this.lastEvaluation = 0;
    this.lastDepth = 0;
    this.lastPV = [];
    this.lastBestMove = '';
  }
}

// Singleton instance
let stockfishInstance: StockfishService | null = null;

export const getStockfish = (): StockfishService => {
  if (!stockfishInstance) {
    stockfishInstance = new StockfishService();
  }
  return stockfishInstance;
};

export default StockfishService;
