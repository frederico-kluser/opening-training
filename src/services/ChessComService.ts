/**
 * Serviço para integração com a API pública do Chess.com
 * API gratuita e sem autenticação para dados públicos
 */

interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  time_class: 'bullet' | 'blitz' | 'rapid' | 'daily';
  rules: string;
  white: {
    rating: number;
    result: string;
    username: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
  };
  accuracies?: {
    white: number;
    black: number;
  };
}

interface ChessComArchives {
  archives: string[];
}

interface ChessComMonthlyGames {
  games: ChessComGame[];
}

interface ChessComProfile {
  player_id: number;
  username: string;
  name?: string;
  country: string;
  last_online: number;
  joined: number;
  status: string;
  is_streamer: boolean;
  verified: boolean;
}

class ChessComService {
  private readonly BASE_URL = 'https://api.chess.com/pub';
  private readonly USER_AGENT = 'ChessTrainingSystem/1.0 (contact: chesstraining@example.com)';

  /**
   * Headers padrão para todas as requisições
   */
  private getHeaders(): HeadersInit {
    return {
      'User-Agent': this.USER_AGENT,
      'Accept-Encoding': 'gzip',
      'Accept': 'application/json'
    };
  }

  /**
   * Obtém o perfil de um jogador
   */
  async getPlayerProfile(username: string): Promise<ChessComProfile> {
    const url = `${this.BASE_URL}/player/${username}`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Erro ao buscar perfil: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtém a lista de arquivos mensais disponíveis
   */
  async getPlayerArchives(username: string): Promise<string[]> {
    const url = `${this.BASE_URL}/player/${username}/games/archives`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivos: ${response.statusText}`);
    }

    const data: ChessComArchives = await response.json();
    return data.archives;
  }

  /**
   * Obtém jogos de um mês específico
   */
  async getMonthlyGames(username: string, year: number, month: number): Promise<ChessComGame[]> {
    const monthStr = month.toString().padStart(2, '0');
    const url = `${this.BASE_URL}/player/${username}/games/${year}/${monthStr}`;

    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Erro ao buscar jogos: ${response.statusText}`);
    }

    const data: ChessComMonthlyGames = await response.json();
    return data.games;
  }

  /**
   * Obtém o PGN de todos os jogos de um mês
   */
  async getMonthlyPGN(username: string, year: number, month: number): Promise<string> {
    const monthStr = month.toString().padStart(2, '0');
    const url = `${this.BASE_URL}/player/${username}/games/${year}/${monthStr}/pgn`;

    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Erro ao buscar PGN: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Obtém jogos do mês mais recente
   */
  async getLatestGames(username: string): Promise<ChessComGame[]> {
    const archives = await this.getPlayerArchives(username);

    if (archives.length === 0) {
      return [];
    }

    // Pegar o URL do mês mais recente
    const latestArchive = archives[archives.length - 1];

    // Extrair ano e mês do URL
    const parts = latestArchive.split('/');
    const year = parseInt(parts[parts.length - 2]);
    const month = parseInt(parts[parts.length - 1]);

    return this.getMonthlyGames(username, year, month);
  }

  /**
   * Obtém todos os jogos de um jogador (com limite)
   */
  async getAllGames(username: string, limit: number = 100): Promise<ChessComGame[]> {
    const archives = await this.getPlayerArchives(username);
    const allGames: ChessComGame[] = [];

    // Começar do mês mais recente
    for (let i = archives.length - 1; i >= 0 && allGames.length < limit; i--) {
      const archiveUrl = archives[i];
      const parts = archiveUrl.split('/');
      const year = parseInt(parts[parts.length - 2]);
      const month = parseInt(parts[parts.length - 1]);

      try {
        const games = await this.getMonthlyGames(username, year, month);
        allGames.push(...games);

        // Aguardar 1 segundo entre requisições (boa prática)
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (allGames.length >= limit) {
          return allGames.slice(0, limit);
        }
      } catch (error) {
        console.error(`Erro ao buscar jogos de ${year}/${month}:`, error);
      }
    }

    return allGames;
  }

  /**
   * Filtra jogos por classe de tempo
   */
  filterByTimeClass(games: ChessComGame[], timeClass: 'bullet' | 'blitz' | 'rapid' | 'daily'): ChessComGame[] {
    return games.filter(game => game.time_class === timeClass);
  }

  /**
   * Filtra apenas jogos rated
   */
  filterRatedGames(games: ChessComGame[]): ChessComGame[] {
    return games.filter(game => game.rated);
  }

  /**
   * Obtém estatísticas do jogador
   */
  async getPlayerStats(username: string): Promise<any> {
    const url = `${this.BASE_URL}/player/${username}/stats`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Converte jogos para formato PGN concatenado
   */
  gamesToPGN(games: ChessComGame[]): string {
    return games.map(game => game.pgn).join('\n\n');
  }

  /**
   * Busca partidas via API de callback do Chess.com (extended-archive)
   * Esta API retorna informações das partidas incluindo IDs
   */
  async getExtendedArchiveGames(username: string, page: number = 1): Promise<any> {
    const url = `/api/chess-com/callback/games/extended-archive?locale=pt_BR&username=${username}&page=${page}&location=all`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro ao buscar partidas: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar extended archive:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes de uma partida específica via API de callback (live/game)
   * Retorna informações detalhadas incluindo FEN e moveList
   */
  async getGameDetails(gameId: number): Promise<any> {
    const url = `/api/chess-com/callback/live/game/${gameId}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes da partida: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao buscar detalhes da partida:', error);
      throw error;
    }
  }

  /**
   * Busca partidas de um usuário e extrai os PGNs de todas elas
   * Retorna uma string com todos os PGNs concatenados
   */
  async fetchGamesAndExtractPGNs(
    username: string,
    monthsToFetch: number = 1,
    onProgress?: (current: number, total: number) => void
  ): Promise<string> {
    try {
      // 1. Buscar lista de arquivos mensais disponíveis
      const archives = await this.getPlayerArchives(username);

      if (archives.length === 0) {
        throw new Error('Nenhum arquivo de partidas encontrado para este usuário');
      }

      // 2. Pegar os últimos N meses
      const archivesToFetch = archives.slice(-monthsToFetch);
      const allPGNs: string[] = [];

      console.log(`🎮 Buscando partidas de ${archivesToFetch.length} mês(es)...`);

      // 3. Para cada mês, buscar todas as partidas
      for (let i = 0; i < archivesToFetch.length; i++) {
        const archiveUrl = archivesToFetch[i];
        const parts = archiveUrl.split('/');
        const year = parseInt(parts[parts.length - 2]);
        const month = parseInt(parts[parts.length - 1]);

        try {
          if (onProgress) {
            onProgress(i + 1, archivesToFetch.length);
          }

          console.log(`📥 Buscando partidas de ${month}/${year}...`);

          // Usar a API pública que retorna objetos com PGN pronto
          const games = await this.getMonthlyGames(username, year, month);

          console.log(`✅ ${games.length} partidas encontradas em ${month}/${year}`);

          // Extrair PGN de cada partida
          games.forEach((game, idx) => {
            if (game.pgn) {
              allPGNs.push(game.pgn);
              console.log(`  ✓ Partida ${idx + 1}: ${game.white.username} vs ${game.black.username}`);
            }
          });

          // Aguardar 1 segundo entre requisições (boa prática com API do Chess.com)
          if (i < archivesToFetch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar partidas de ${month}/${year}:`, error);
          // Continua mesmo se um mês falhar
        }
      }

      console.log(`📊 Total de PGNs extraídos: ${allPGNs.length} partidas`);

      if (allPGNs.length === 0) {
        throw new Error('Não foi possível extrair PGNs das partidas. Verifique se o usuário existe e tem partidas públicas.');
      }

      // 4. Juntar todos os PGNs numa string separada por quebras de linha duplas
      return allPGNs.join('\n\n');
    } catch (error) {
      console.error('Erro ao buscar e extrair PGNs:', error);
      throw error;
    }
  }

  /**
   * Busca e exibe informações de exemplo
   */
  async testFetchGames(username: string = 'hikaru'): Promise<void> {
    console.log(`\n=== Buscando dados do jogador ${username} ===\n`);

    try {
      // 1. Buscar perfil
      console.log('1. Buscando perfil...');
      const profile = await this.getPlayerProfile(username);
      console.log('Perfil:', {
        username: profile.username,
        player_id: profile.player_id,
        country: profile.country,
        joined: new Date(profile.joined * 1000).toLocaleDateString()
      });

      // 2. Buscar arquivos mensais
      console.log('\n2. Buscando arquivos mensais...');
      const archives = await this.getPlayerArchives(username);
      console.log(`Total de meses com jogos: ${archives.length}`);
      console.log(`Primeiro mês: ${archives[0]}`);
      console.log(`Último mês: ${archives[archives.length - 1]}`);

      // 3. Buscar jogos do mês mais recente
      console.log('\n3. Buscando jogos do mês mais recente...');
      const latestGames = await this.getLatestGames(username);
      console.log(`Total de jogos no mês mais recente: ${latestGames.length}`);

      // 4. Analisar tipos de jogos
      const bulletGames = this.filterByTimeClass(latestGames, 'bullet');
      const blitzGames = this.filterByTimeClass(latestGames, 'blitz');
      const rapidGames = this.filterByTimeClass(latestGames, 'rapid');

      console.log(`- Bullet: ${bulletGames.length} jogos`);
      console.log(`- Blitz: ${blitzGames.length} jogos`);
      console.log(`- Rapid: ${rapidGames.length} jogos`);

      // 5. Mostrar últimos 3 jogos
      console.log('\n4. Últimos 3 jogos:');
      latestGames.slice(0, 3).forEach((game, index) => {
        console.log(`\nJogo ${index + 1}:`);
        console.log(`- Brancas: ${game.white.username} (${game.white.rating})`);
        console.log(`- Pretas: ${game.black.username} (${game.black.rating})`);
        console.log(`- Resultado: ${game.white.result} vs ${game.black.result}`);
        console.log(`- Classe: ${game.time_class}`);
        console.log(`- Controle: ${game.time_control}`);
        console.log(`- URL: ${game.url}`);
      });

      // 6. Estatísticas
      console.log('\n5. Buscando estatísticas...');
      const stats = await this.getPlayerStats(username);
      if (stats.chess_blitz) {
        console.log('Rating Blitz:', {
          atual: stats.chess_blitz.last?.rating,
          melhor: stats.chess_blitz.best?.rating,
          jogos: stats.chess_blitz.record
        });
      }

      console.log('\n=== Busca concluída com sucesso! ===\n');

    } catch (error) {
      console.error('Erro durante a busca:', error);
      throw error;
    }
  }
}

// Exportar singleton
const chessComService = new ChessComService();
export default chessComService;

// Exportar tipos
export type { ChessComGame, ChessComProfile };