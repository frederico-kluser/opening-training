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

    // Caminhos comuns onde Stockfish pode estar instalado
    const paths = {
      darwin: [
        '/usr/local/bin/stockfish',
        '/opt/homebrew/bin/stockfish',
        path.join(process.env.HOME, 'stockfish'),
      ],
      linux: [
        '/usr/bin/stockfish',
        '/usr/local/bin/stockfish',
        path.join(process.env.HOME, 'stockfish'),
      ],
      win32: [
        'C:\\Program Files\\Stockfish\\stockfish.exe',
        'C:\\stockfish\\stockfish.exe',
        path.join(process.env.USERPROFILE, 'stockfish.exe'),
      ]
    };

    // Adiciona PATH do projeto
    const projectPath = path.join(__dirname, '..', 'stockfish',
      platform === 'win32' ? 'stockfish.exe' : 'stockfish'
    );

    if (paths[platform]) {
      paths[platform].unshift(projectPath);
      return paths[platform];
    }

    return [projectPath];
  }

  /**
   * Inicia o processo do Stockfish
   */
  async init() {
    return new Promise((resolve, reject) => {
      // Tenta encontrar Stockfish em um dos caminhos
      const stockfishPaths = Array.isArray(this.stockfishPath)
        ? this.stockfishPath
        : [this.stockfishPath];

      let stockfishFound = false;
      let lastError = null;

      for (const stockfishPath of stockfishPaths) {
        try {
          console.log(`🔍 Tentando Stockfish em: ${stockfishPath}`);
          this.process = spawn(stockfishPath);

          // Verificar se o processo foi criado com sucesso
          this.process.on('error', (err) => {
            lastError = err;
          });

          // Aguardar um pouco para ver se há erro imediato
          setTimeout(() => {
            if (!lastError) {
              stockfishFound = true;
            }
          }, 100);

          if (stockfishFound || !lastError) {
            stockfishFound = true;
            break;
          }
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      // Aguardar verificação do spawn
      setTimeout(() => {
        if (!stockfishFound || !this.process || this.process.killed) {
          return reject(new Error(
            `❌ Stockfish não encontrado!\n\n` +
            `Instale o Stockfish:\n` +
            `- macOS: brew install stockfish\n` +
            `- Linux: sudo apt install stockfish\n` +
            `- Windows: baixe de https://stockfishchess.org/\n\n` +
            `Ou coloque o binário em: ${path.join(__dirname, '..', 'stockfish')}\n\n` +
            `Último erro: ${lastError?.message || 'Desconhecido'}`
          ));
        }

        let readyOk = false;

        this.process.stdout.on('data', (data) => {
          const output = data.toString();
          this.outputBuffer.push(output);

          if (output.includes('uciok')) {
            this.ready = true;
          }

          if (output.includes('readyok')) {
            readyOk = true;
          }
        });

        this.process.stderr.on('data', (data) => {
          console.error(`Stockfish error: ${data}`);
        });

        this.process.on('close', (code) => {
          console.log(`Stockfish process exited with code ${code}`);
        });

        // Inicializar UCI
        this.sendCommand('uci');

        // Aguardar ready
        let checkInterval;
        const checkReady = () => {
          if (this.ready && !readyOk) {
            // Configurar opções
            this.sendCommand(`setoption name Threads value ${this.threads}`);
            this.sendCommand(`setoption name Hash value ${this.hash}`);
            this.sendCommand('isready');
          }

          if (this.ready && readyOk) {
            clearInterval(checkInterval);
            clearTimeout(timeoutHandle);
            console.log(`✅ Stockfish iniciado: ${this.threads} threads, ${this.hash}MB hash`);
            resolve();
          }
        };

        checkInterval = setInterval(checkReady, 100);

        // Timeout de 10 segundos (aumentado para sistemas lentos)
        const timeoutHandle = setTimeout(() => {
          clearInterval(checkInterval);
          this.quit();
          reject(new Error('Timeout ao inicializar Stockfish (10s). Verifique se o binário funciona corretamente.'));
        }, 10000);
      }, 150);
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
