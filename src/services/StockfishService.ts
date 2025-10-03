/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';

interface StockfishAnalysis {
  bestMove: string;
  evaluation: number; // em centipawns
  depth: number;
  pv: string[]; // principal variation
}

class StockfishService extends EventEmitter {
  private worker: Worker | null = null;
  private isReady = false;
  private analysisCallbacks = new Map<string, (result: StockfishAnalysis) => void>();
  private lastEvaluation = 0;
  private lastDepth = 0;
  private lastPV: string[] = [];
  private currentFen = '';

  constructor() {
    super();
    this.initEngine();
  }

  private initEngine() {
    try {
      this.worker = new Worker('/stockfish.wasm.js');

      this.worker.onmessage = (e) => {
        const message = e.data;
        console.log('Stockfish:', message); // Debug log

        // Engine ready
        if (message === 'readyok') {
          this.isReady = true;
          this.emit('ready');
          console.log('Stockfish is ready!');
        }

        // Best move found
        if (message.startsWith('bestmove')) {
          const parts = message.split(' ');
          const bestMove = parts[1];
          const fen = this.getCurrentAnalysisFen();

          if (fen && this.analysisCallbacks.has(fen)) {
            const callback = this.analysisCallbacks.get(fen)!;
            callback({
              bestMove,
              evaluation: this.lastEvaluation || 0,
              depth: this.lastDepth || 0,
              pv: this.lastPV || []
            });
            this.analysisCallbacks.delete(fen);
          }
        }

        // Evaluation info
        if (message.startsWith('info')) {
          this.parseInfo(message);
        }
      };

      this.worker.onerror = (e) => {
        console.error('Stockfish worker error:', e);
      };

      // Initialize UCI
      this.send('uci');
      this.send('isready');

    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  private getCurrentAnalysisFen() {
    return this.currentFen;
  }

  private parseInfo(message: string) {
    // Parse depth
    const depthMatch = message.match(/depth (\d+)/);
    if (depthMatch) {
      this.lastDepth = parseInt(depthMatch[1]);
    }

    // Parse evaluation in centipawns
    const cpMatch = message.match(/cp (-?\d+)/);
    if (cpMatch) {
      this.lastEvaluation = parseInt(cpMatch[1]);
    }

    // Parse mate score
    const mateMatch = message.match(/mate (-?\d+)/);
    if (mateMatch) {
      const mateIn = parseInt(mateMatch[1]);
      // Convert mate to centipawns (100000 = mate)
      this.lastEvaluation = mateIn > 0 ? 100000 - mateIn : -100000 + mateIn;
    }

    // Parse principal variation
    const pvMatch = message.match(/pv (.+)/);
    if (pvMatch) {
      this.lastPV = pvMatch[1].split(' ');
    }
  }

  private send(command: string) {
    if (this.worker) {
      console.log('Sending to Stockfish:', command);
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

  async analyze(fen: string, depth: number = 15): Promise<StockfishAnalysis> {
    // Wait for engine to be ready
    await this.waitForReady();

    return new Promise((resolve) => {
      this.currentFen = fen;
      this.analysisCallbacks.set(fen, resolve);

      // Reset evaluation values
      this.lastEvaluation = 0;
      this.lastDepth = 0;
      this.lastPV = [];

      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.analysisCallbacks.has(fen)) {
          this.analysisCallbacks.delete(fen);
          resolve({
            bestMove: '',
            evaluation: 0,
            depth: 0,
            pv: []
          });
        }
      }, 10000);
    });
  }

  setSkillLevel(level: number) {
    // 0-20, where 0 is weakest
    this.send(`setoption name Skill Level value ${level}`);
  }

  stop() {
    this.send('stop');
  }

  quit() {
    this.send('quit');
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
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