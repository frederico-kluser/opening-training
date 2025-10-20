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
    this.stockfishPath = this.getStockfishPath();
    this.process = null;
    this.ready = false;
    this.isAnalyzing = false;
    this.outputBuffer = [];
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

      try {
        this.process = spawn(stockfishPath);
      } catch (err) {
        resolve(false);
        return;
      }

      // Se houver erro ao spawnar
      this.process.on('error', () => {
        processError = true;
        resolve(false);
      });

      // Timeout de 5 segundos para este caminho
      const timeout = setTimeout(() => {
        if (!this.ready || !readyOk) {
          if (this.process) {
            this.process.kill();
            this.process = null;
          }
          resolve(false);
        }
      }, 5000);

      // Handler de saída de dados
      this.process.stdout.on('data', (data) => {
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

      this.process.stderr.on('data', (data) => {
        // Ignora stderr silenciosamente durante init
      });

      this.process.on('close', (code) => {
        if (code !== 0 && !processError) {
          processError = true;
          resolve(false);
        }
      });

      // Aguardar um pouco e então enviar comandos UCI
      setTimeout(() => {
        if (processError || !this.process) {
          resolve(false);
          return;
        }

        // Inicializar UCI
        this.sendCommand('uci');

        // Aguardar UCI ready
        setTimeout(() => {
          if (this.ready && !processError && this.process) {
            // Configurar opções
            this.sendCommand(`setoption name Threads value ${this.threads}`);
            this.sendCommand(`setoption name Hash value ${this.hash}`);
            this.sendCommand('isready');
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
      this.process.stdin.write(command + '\n');
    }
  }

  /**
   * Analisa uma posição FEN
   */
  async analyze(fen, depth = this.depth) {
    return new Promise((resolve) => {
      if (this.isAnalyzing) {
        console.warn('⚠️ Análise já em andamento, aguardando...');
      }

      this.isAnalyzing = true;
      this.outputBuffer = [];

      let bestMove = '';
      let evaluation = 0;
      let isMate = false;
      let mateIn = 0;

      const dataHandler = (data) => {
        const output = data.toString();

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

          // Limpar listener e resolver
          this.process.stdout.removeListener('data', dataHandler);
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
