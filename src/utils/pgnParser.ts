export interface ParsedGame {
  headers: Record<string, string>;
  moves: string;
  fullPGN: string;
}

export interface GameInfo {
  index: number;
  white: string;
  black: string;
  result: string;
  date: string;
  event: string;
}

/**
 * Parse multiple PGN games from a string
 * @param pgnText String containing one or more PGN games
 * @returns Array of parsed games
 */
export function parseMultiplePGN(pgnText: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const lines = pgnText.split('\n');

  let currentGame: ParsedGame = {
    headers: {},
    moves: '',
    fullPGN: ''
  };

  let inMoves = false;
  let gameLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Header line
    if (line.startsWith('[') && line.endsWith(']')) {
      // If we were in moves section, save the previous game
      if (inMoves && (currentGame.moves || Object.keys(currentGame.headers).length > 0)) {
        currentGame.fullPGN = gameLines.join('\n');
        games.push(currentGame);
        currentGame = {
          headers: {},
          moves: '',
          fullPGN: ''
        };
        gameLines = [];
        inMoves = false;
      }

      // Parse header
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        currentGame.headers[match[1]] = match[2];
      }
      gameLines.push(line);
    }
    // Move line
    else if (line && !line.startsWith('[')) {
      inMoves = true;
      currentGame.moves += (currentGame.moves ? ' ' : '') + line;
      gameLines.push(line);
    }
    // Empty line
    else if (!line && gameLines.length > 0) {
      gameLines.push(line);
    }
  }

  // Save the last game if exists
  if (currentGame.moves || Object.keys(currentGame.headers).length > 0) {
    currentGame.fullPGN = gameLines.join('\n');
    games.push(currentGame);
  }

  return games;
}

/**
 * Extract game information for display
 * @param games Array of parsed games
 * @returns Array of game information
 */
export function extractGamesInfo(games: ParsedGame[]): GameInfo[] {
  return games.map((game, index) => ({
    index,
    white: game.headers['White'] || 'Unknown',
    black: game.headers['Black'] || 'Unknown',
    result: game.headers['Result'] || '*',
    date: game.headers['Date'] || '',
    event: game.headers['Event'] || 'Unknown Event'
  }));
}

/**
 * Check if the player is in the given games and return their colors
 * @param games Array of parsed games
 * @param playerName Name of the player to search
 * @returns Map of game index to player's color
 */
export function getPlayerColors(games: ParsedGame[], playerName: string): Map<number, 'white' | 'black' | null> {
  const colors = new Map<number, 'white' | 'black' | null>();

  games.forEach((game, index) => {
    const white = game.headers['White']?.toLowerCase();
    const black = game.headers['Black']?.toLowerCase();
    const searchName = playerName.toLowerCase();

    if (white?.includes(searchName)) {
      colors.set(index, 'white');
    } else if (black?.includes(searchName)) {
      colors.set(index, 'black');
    } else {
      colors.set(index, null);
    }
  });

  return colors;
}

/**
 * Detect the most frequent player in the games
 * @param games Array of parsed games
 * @returns Object with the most frequent player name and their positions in each game
 */
export function detectMostFrequentPlayer(games: ParsedGame[]): {
  playerName: string | null;
  positions: Map<number, 'white' | 'black'>;
  frequency: number;
} {
  if (games.length === 0) {
    return { playerName: null, positions: new Map(), frequency: 0 };
  }

  // Count frequency of each player name
  const playerCount = new Map<string, number>();
  const playerPositions = new Map<string, Map<number, 'white' | 'black'>>();

  games.forEach((game, index) => {
    const white = game.headers['White'];
    const black = game.headers['Black'];

    if (white) {
      const count = playerCount.get(white) || 0;
      playerCount.set(white, count + 1);

      if (!playerPositions.has(white)) {
        playerPositions.set(white, new Map());
      }
      playerPositions.get(white)!.set(index, 'white');
    }

    if (black) {
      const count = playerCount.get(black) || 0;
      playerCount.set(black, count + 1);

      if (!playerPositions.has(black)) {
        playerPositions.set(black, new Map());
      }
      playerPositions.get(black)!.set(index, 'black');
    }
  });

  // Find the most frequent player
  let mostFrequent: string | null = null;
  let maxCount = 0;

  for (const [player, count] of playerCount.entries()) {
    // Only consider players that appear in at least 50% of games
    if (count > maxCount && count >= Math.ceil(games.length * 0.5)) {
      mostFrequent = player;
      maxCount = count;
    }
  }

  // If we found a frequent player, return their positions
  if (mostFrequent) {
    return {
      playerName: mostFrequent,
      positions: playerPositions.get(mostFrequent) || new Map(),
      frequency: maxCount
    };
  }

  return { playerName: null, positions: new Map(), frequency: 0 };
}

/**
 * Detect if PGN contains multiple games
 * @param pgnText PGN text to check
 * @returns true if contains multiple games
 */
export function hasMultipleGames(pgnText: string): boolean {
  const games = parseMultiplePGN(pgnText);
  return games.length > 1;
}

/**
 * Validate if a string is valid PGN format
 * @param pgnText Text to validate
 * @returns Object with validation result and error message if invalid
 */
export function validatePGN(pgnText: string): { valid: boolean; error?: string } {
  if (!pgnText || !pgnText.trim()) {
    return { valid: false, error: 'PGN vazio ou inválido' };
  }

  const games = parseMultiplePGN(pgnText);

  if (games.length === 0) {
    return { valid: false, error: 'Nenhuma partida válida encontrada no PGN' };
  }

  // Verificar se cada partida tem pelo menos os headers básicos e movimentos
  for (let i = 0; i < games.length; i++) {
    const game = games[i];

    // Verificar headers essenciais
    if (!game.headers['White'] && !game.headers['Black']) {
      return {
        valid: false,
        error: `Partida ${i + 1}: Faltam informações dos jogadores`
      };
    }

    // Verificar se tem movimentos
    if (!game.moves || game.moves.trim().length === 0) {
      return {
        valid: false,
        error: `Partida ${i + 1}: Nenhum movimento encontrado`
      };
    }

    // Verificar formato básico de movimentos (deve ter pelo menos um número seguido de ponto)
    if (!game.moves.match(/\d+\./)) {
      return {
        valid: false,
        error: `Partida ${i + 1}: Formato de movimentos inválido`
      };
    }
  }

  return { valid: true };
}