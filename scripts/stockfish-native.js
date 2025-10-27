/**
 * Stockfish Native Wrapper - UCI Communication
 * Comunica diretamente com binário nativo do Stockfish via UCI
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

class StockfishNative {
  constructor(options = {}) {
    this.depth = options.depth || 18;
    this.threads = options.threads || os.cpus().length;
    this.hash = options.hash || 2048; // MB
    this.verbose = options.verbose || false; // 🆕 Modo debug
    this.stockfishPath = this.getStockfishPath();
    this.process = null;
    this.ready = false;
    this.isAnalyzing = false;
    this.outputBuffer = [];
    this.analyzeCount = 0; // 🆕 Contador de análises
  }

  /**
   * Detecta caminho do Stockfish baseado no OS
   */
  getStockfishPath() {
    const platform = os.platform();
    const paths = [];

    // PATH do projeto
    const projectPath = path.join(__dirname, '..', 'stockfish',
      platform === 'win32' ? 'stockfish.exe' : 'stockfish'
    );
    paths.push(projectPath);

    // Caminhos comuns baseados no OS
    if (platform === 'darwin') {
      paths.push('/opt/homebrew/bin/stockfish');
      paths.push('/usr/local/bin/stockfish');
      if (process.env.HOME) {
        paths.push(path.join(process.env.HOME, 'stockfish'));
      }
    } else if (platform === 'linux') {
      paths.push('/usr/bin/stockfish');
      paths.push('/usr/local/bin/stockfish');
      paths.push('/usr/games/stockfish');
      if (process.env.HOME) {
        paths.push(path.join(process.env.HOME, 'stockfish'));
      }
    } else if (platform === 'win32') {
      paths.push('C:\\Program Files\\Stockfish\\stockfish.exe');
      paths.push('C:\\stockfish\\stockfish.exe');
      if (process.env.USERPROFILE) {
        paths.push(path.join(process.env.USERPROFILE, 'stockfish.exe'));
      }
    }

    // Tenta usar "stockfish" diretamente do PATH do sistema
    paths.push('stockfish');

    return paths.filter(p => p && typeof p === 'string');
  }

  /**
   * Inicia o processo do Stockfish
   */
  async init() {
    const stockfishPaths = Array.isArray(this.stockfishPath)
      ? this.stockfishPath
      : [this.stockfishPath];

    // Tenta cada caminho sequencialmente
    for (const stockfishPath of stockfishPaths) {
      try {
        console.log(`🔍 Tentando Stockfish em: ${stockfishPath}`);

        // Tenta spawnar o processo
        const result = await this.trySpawnStockfish(stockfishPath);

        if (result) {
          console.log(`✅ Stockfish iniciado: ${this.threads} threads, ${this.hash}MB hash`);
          return; // Sucesso!
        }
      } catch (err) {
        // Continua tentando próximo caminho
        continue;
      }
    }

    // Nenhum caminho funcionou
    throw new Error(
      `❌ Stockfish não encontrado!\n\n` +
      `Instale o Stockfish:\n` +
      `- macOS: brew install stockfish\n` +
      `- Linux: sudo apt install stockfish\n` +
      `- Windows: baixe de https://stockfishchess.org/\n\n` +
      `Ou coloque o binário em: ${path.join(__dirname, '..', 'stockfish')}\n\n` +
      `Caminhos tentados:\n${stockfishPaths.map(p => `  - ${p}`).join('\n')}`
    );
  }

  /**
   * Tenta spawnar Stockfish em um caminho específico
   */
  async trySpawnStockfish(stockfishPath) {
    return new Promise((resolve) => {
      let processError = false;
      let readyOk = false;
      let localProcess = null;

      try {
        localProcess = spawn(stockfishPath);
        this.process = localProcess; // Guarda referência
      } catch (err) {
        resolve(false);
        return;
      }

      // Se houver erro ao spawnar
      localProcess.on('error', () => {
        processError = true;
        if (this.process === localProcess) {
          this.process = null;
        }
        resolve(false);
      });

      // Timeout de 5 segundos para este caminho
      const timeout = setTimeout(() => {
        if (!this.ready || !readyOk) {
          if (localProcess && !localProcess.killed) {
            localProcess.kill();
          }
          if (this.process === localProcess) {
            this.process = null;
          }
          resolve(false);
        }
      }, 5000);

      // Handler de saída de dados
      localProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.outputBuffer.push(output);

        if (output.includes('uciok')) {
          this.ready = true;
        }

        if (output.includes('readyok')) {
          readyOk = true;
          clearTimeout(timeout);
          resolve(true);
        }
      });

      localProcess.stderr.on('data', (data) => {
        // Ignora stderr silenciosamente durante init
      });

      localProcess.on('close', (code) => {
        if (code !== 0 && !processError) {
          processError = true;
          if (this.process === localProcess) {
            this.process = null;
          }
          resolve(false);
        }
      });

      // Aguardar um pouco e então enviar comandos UCI
      setTimeout(() => {
        if (processError || !localProcess || localProcess.killed) {
          resolve(false);
          return;
        }

        // Inicializar UCI
        if (localProcess.stdin) {
          localProcess.stdin.write('uci\n');
          if (this.verbose) {
            console.log(`[UCI →] uci`);
          }
        }

        // Aguardar UCI ready
        setTimeout(() => {
          if (this.ready && !processError && localProcess && !localProcess.killed) {
            // Configurar opções
            if (localProcess.stdin) {
              localProcess.stdin.write(`setoption name Threads value ${this.threads}\n`);
              localProcess.stdin.write(`setoption name Hash value ${this.hash}\n`);
              localProcess.stdin.write('isready\n');

              if (this.verbose) {
                console.log(`[UCI →] setoption name Threads value ${this.threads}`);
                console.log(`[UCI →] setoption name Hash value ${this.hash}`);
                console.log(`[UCI →] isready`);
              }
            }
          } else if (!processError) {
            resolve(false);
          }
        }, 500);
      }, 100);
    });
  }

  /**
   * Envia comando UCI
   */
  sendCommand(command) {
    if (this.process && this.process.stdin) {
      if (this.verbose && !command.startsWith('position')) {
        console.log(`[UCI →] ${command}`);
      }
      this.process.stdin.write(command + '\n');
    }
  }

  /**
   * Analisa uma posição FEN
   */
  async analyze(fen, depth = this.depth) {
    return new Promise((resolve, reject) => {
      if (this.isAnalyzing) {
        console.warn('⚠️ Análise já em andamento, aguardando...');
      }

      this.analyzeCount++;
      const analyzeId = this.analyzeCount;

      if (this.verbose) {
        console.log(`\n[Análise #${analyzeId}] Iniciando (depth: ${depth})`);
        console.log(`[Análise #${analyzeId}] FEN: ${fen.substring(0, 50)}...`);
      }

      this.isAnalyzing = true;
      this.outputBuffer = [];

      let bestMove = '';
      let evaluation = 0;
      let isMate = false;
      let mateIn = 0;
      let receivedBestMove = false;

      // Timeout de 2 minutos
      const timeout = setTimeout(() => {
        if (!receivedBestMove) {
          if (this.process && this.process.stdout) {
            this.process.stdout.removeListener('data', dataHandler);
          }
          this.isAnalyzing = false;
          console.error(`\n❌ [Análise #${analyzeId}] TIMEOUT após 2 minutos!`);
          console.error(`   FEN: ${fen}`);
          reject(new Error(`Análise timeout após 2 minutos`));
        }
      }, 120000);

      const dataHandler = (data) => {
        const output = data.toString();

        if (this.verbose && output.includes('depth')) {
          const depthMatch = output.match(/depth (\d+)/);
          if (depthMatch) {
            process.stdout.write(`\r[Análise #${analyzeId}] depth ${depthMatch[1]}/${depth} `);
          }
        }

        // Parse evaluation
        if (output.includes('score cp')) {
          const match = output.match(/score cp (-?\d+)/);
          if (match) {
            evaluation = parseInt(match[1]);
            isMate = false;
          }
        }

        // Parse mate
        if (output.includes('score mate')) {
          const match = output.match(/score mate (-?\d+)/);
          if (match) {
            mateIn = parseInt(match[1]);
            evaluation = mateIn > 0 ? 100000 : -100000;
            isMate = true;
          }
        }

        // Parse best move
        if (output.includes('bestmove')) {
          const match = output.match(/bestmove (\S+)/);
          if (match) {
            bestMove = match[1];
          }

          receivedBestMove = true;
          clearTimeout(timeout);

          if (this.verbose) {
            console.log(`\n[Análise #${analyzeId}] Completa! bestmove: ${bestMove}, eval: ${evaluation}cp`);
          }

          // Limpar listener e resolver
          if (this.process && this.process.stdout) {
            this.process.stdout.removeListener('data', dataHandler);
          }
          this.isAnalyzing = false;

          resolve({
            evaluation,
            bestMove,
            isMate,
            mateIn: isMate ? Math.abs(mateIn) : 0
          });
        }
      };

      this.process.stdout.on('data', dataHandler);

      // Enviar comandos
      this.sendCommand('ucinewgame');
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
    });
  }

  /**
   * Fecha o processo
   */
  quit() {
    if (this.process) {
      this.sendCommand('quit');
      this.process.kill();
      this.process = null;
      this.ready = false;
    }
  }
}

module.exports = StockfishNative;
