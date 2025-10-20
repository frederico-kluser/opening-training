/**
 * Chess.com API Client
 * Baixa partidas de um usuário usando a Public Data API
 */

const https = require('https');

class ChessComAPI {
  constructor() {
    this.baseUrl = 'https://api.chess.com/pub';
    this.userAgent = 'OpeningTrainingApp/2.0 (Node.js chess analyzer)';
    this.requestDelay = 1000; // 1 segundo entre requests (rate limiting)
  }

  /**
   * Faz request HTTP
   */
  async request(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': this.userAgent
        }
      };

      https.get(url, options, (res) => {
        let data = '';

        if (res.statusCode === 429) {
          return reject(new Error('Rate limit excedido! Aguarde alguns minutos e tente novamente.'));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            // Chess.com retorna PGN como texto, não JSON
            if (url.endsWith('/pgn')) {
              resolve(data);
            } else {
              resolve(JSON.parse(data));
            }
          } catch (err) {
            reject(new Error(`Erro ao parsear resposta: ${err.message}`));
          }
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Aguarda entre requests (rate limiting)
   */
  async delay(ms = this.requestDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se usuário existe
   */
  async getPlayer(username) {
    const url = `${this.baseUrl}/player/${username.toLowerCase()}`;
    return await this.request(url);
  }

  /**
   * Obtém lista de arquivos mensais disponíveis
   */
  async getArchives(username) {
    const url = `${this.baseUrl}/player/${username.toLowerCase()}/games/archives`;
    const data = await this.request(url);
    return data.archives || [];
  }

  /**
   * Baixa partidas de um mês específico em formato PGN
   */
  async getMonthGames(username, year, month) {
    const monthStr = month.toString().padStart(2, '0');
    const url = `${this.baseUrl}/player/${username.toLowerCase()}/games/${year}/${monthStr}/pgn`;

    await this.delay(); // Rate limiting
    return await this.request(url);
  }

  /**
   * Baixa partidas de um arquivo específico (URL completa)
   */
  async getArchiveGames(archiveUrl) {
    const url = archiveUrl.endsWith('/pgn') ? archiveUrl : `${archiveUrl}/pgn`;

    await this.delay(); // Rate limiting
    return await this.request(url);
  }

  /**
   * Baixa todas as partidas de um usuário
   * @param {string} username - Nome do usuário Chess.com
   * @param {object} options - Opções de download
   * @param {number} options.limit - Limitar quantidade de meses (null = todos)
   * @param {Function} options.onProgress - Callback de progresso (current, total, monthInfo)
   * @returns {string} PGN concatenado de todas as partidas
   */
  async getAllGames(username, options = {}) {
    const { limit = null, onProgress = null } = options;

    console.log(`\n🔍 Buscando partidas de ${username}...`);

    // Verificar se usuário existe
    try {
      await this.getPlayer(username);
    } catch (err) {
      throw new Error(`Usuário "${username}" não encontrado no Chess.com. Verifique o nome de usuário.`);
    }

    // Obter lista de arquivos
    const archives = await this.getArchives(username);

    if (archives.length === 0) {
      throw new Error(`Nenhuma partida encontrada para o usuário "${username}"`);
    }

    console.log(`✅ ${archives.length} arquivo(s) mensal(is) encontrado(s)`);

    // Limitar quantidade se especificado
    const archivesToDownload = limit ? archives.slice(-limit) : archives;

    if (limit && limit < archives.length) {
      console.log(`📌 Baixando apenas os últimos ${limit} mês(es)`);
    }

    // Baixar cada arquivo
    let allPgn = '';
    const total = archivesToDownload.length;

    for (let i = 0; i < archivesToDownload.length; i++) {
      const archiveUrl = archivesToDownload[i];

      // Extrair ano/mês da URL para exibição
      const match = archiveUrl.match(/\/(\d{4})\/(\d{2})$/);
      const monthInfo = match ? `${match[1]}/${match[2]}` : archiveUrl;

      if (onProgress) {
        onProgress(i + 1, total, monthInfo);
      }

      try {
        const pgn = await this.getArchiveGames(archiveUrl);

        if (pgn && pgn.trim().length > 0) {
          allPgn += pgn + '\n\n';
        }
      } catch (err) {
        console.warn(`⚠️  Erro ao baixar ${monthInfo}: ${err.message}`);
      }
    }

    return allPgn;
  }

  /**
   * Baixa partidas dos últimos N meses
   */
  async getRecentGames(username, months = 3) {
    return await this.getAllGames(username, {
      limit: months,
      onProgress: (current, total, monthInfo) => {
        const percentage = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        process.stdout.write(
          `\r📥 Baixando: [${bar}] ${percentage}% (${current}/${total}) - ${monthInfo}   `
        );
      }
    });
  }

  /**
   * Estatísticas de partidas baixadas
   */
  countGames(pgn) {
    const games = pgn.match(/\[Event\s+"/g) || [];
    return games.length;
  }
}

module.exports = ChessComAPI;
