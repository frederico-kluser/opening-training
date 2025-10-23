import { Chess } from 'chess.js';

/**
 * Utilitários compartilhados entre PuzzleTrainer e OpeningTrainer
 * v2.0.0 - Evita DRY (Don't Repeat Yourself)
 */

/**
 * Posição de treinamento com contexto (movimento anterior do adversário)
 */
export interface TrainingPosition {
  fen: string;                    // Posição onde usuário deve jogar
  fenContext?: string;            // Posição antes do movimento do adversário (contexto)
  color: 'white' | 'black';      // Cor que o usuário joga
  comment?: string;               // Comentário/dica da posição
  validNextFens?: string[];       // FENs válidos após movimento do usuário
}

/**
 * Informações do movimento do adversário
 */
export interface OpponentMoveInfo {
  shouldShow: boolean;            // Se deve mostrar movimento do adversário
  fenBefore: string;             // FEN antes do movimento
  fenAfter: string;              // FEN depois do movimento
  move?: string;                 // Movimento em SAN (se disponível)
}

/**
 * Determina se deve mostrar o movimento do adversário
 * Regra: Mostra movimento do adversário, EXCETO se o primeiro movimento for do usuário
 *
 * @param position - Posição de treinamento
 * @returns Informações sobre exibição do movimento adversário
 */
export function shouldShowOpponentMove(position: TrainingPosition): OpponentMoveInfo {
  const { fen, fenContext, color } = position;

  // Se não tem contexto, não mostra
  if (!fenContext) {
    return {
      shouldShow: false,
      fenBefore: fen,
      fenAfter: fen
    };
  }

  // Verifica quem joga na posição de contexto
  const contextGame = new Chess(fenContext);
  const contextTurn = contextGame.turn(); // 'w' ou 'b'

  // Se na posição de contexto é a vez do USUÁRIO, NÃO mostra movimento adversário
  // (significa que o primeiro movimento é do usuário)
  const isUserTurnInContext = (
    (color === 'white' && contextTurn === 'w') ||
    (color === 'black' && contextTurn === 'b')
  );

  if (isUserTurnInContext) {
    return {
      shouldShow: false,
      fenBefore: fen,
      fenAfter: fen
    };
  }

  // Caso contrário, mostra o movimento do adversário
  // Calcula o movimento (contexto -> posição atual)
  // (isso é complexo, então deixamos opcional por enquanto)
  const move: string | undefined = undefined;

  return {
    shouldShow: true,
    fenBefore: fenContext,
    fenAfter: fen,
    move
  };
}

/**
 * Gera sequência de posições de treinamento com contexto
 * Similar ao Fisher-Yates shuffle mas mantém informações de contexto
 *
 * @param positions - Mapa de posições (FEN -> dados)
 * @param color - Cor que o usuário joga
 * @param count - Número de posições a gerar
 * @returns Array de posições de treinamento
 */
export function generateTrainingSequence(
  positions: {
    [fen: string]: {
      prevFen: string;
      comment: string;
      nextFen: string[];
    };
  },
  color: 'white' | 'black',
  count: number = 20
): TrainingPosition[] {
  // Filtra apenas posições treináveis (que têm nextFen) E onde é a vez da cor do usuário
  const trainablePositions = Object.keys(positions).filter(fen => {
    const pos = positions[fen];

    // Verificar se tem movimentos válidos
    if (!pos.nextFen || pos.nextFen.length === 0) {
      return false;
    }

    // ✅ NOVO: Verificar se é a vez da cor do usuário jogar
    try {
      const game = new Chess(fen);
      const currentTurn = game.turn(); // 'w' ou 'b'
      const expectedTurn = color === 'white' ? 'w' : 'b';

      // Só inclui se for a vez da cor correta
      return currentTurn === expectedTurn;
    } catch (error) {
      console.error('❌ Erro ao validar FEN:', fen, error);
      return false;
    }
  });

  // Log para debug
  const totalPositions = Object.keys(positions).length;
  console.log(`📚 Posições filtradas: ${trainablePositions.length} de ${totalPositions} posições são da vez de ${color === 'white' ? '⬜ brancas' : '⬛ pretas'} jogarem`);

  // Avisar se não houver posições da cor correta
  if (trainablePositions.length === 0) {
    console.warn(`⚠️ ATENÇÃO: Nenhuma posição encontrada onde é a vez de ${color} jogar! Verifique se a abertura foi cadastrada corretamente.`);
    return [];
  }

  // Embaralha usando Fisher-Yates
  const shuffled = [...trainablePositions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Se precisa de mais posições que as disponíveis, repete com re-embaralhamento
  let selectedFens: string[] = [];
  if (shuffled.length < count && shuffled.length > 0) {
    while (selectedFens.length < count) {
      const reShuffled = [...shuffled];
      for (let i = reShuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reShuffled[i], reShuffled[j]] = [reShuffled[j], reShuffled[i]];
      }
      selectedFens.push(...reShuffled);
    }
    selectedFens = selectedFens.slice(0, count);
  } else {
    selectedFens = shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Converte para TrainingPosition com contexto
  return selectedFens.map(fen => {
    const pos = positions[fen];

    return {
      fen,
      fenContext: pos.prevFen || undefined,
      color,
      comment: pos.comment,
      validNextFens: pos.nextFen
    };
  });
}

/**
 * Valida se um movimento leva a uma posição válida
 *
 * @param currentFen - FEN atual
 * @param userColor - Cor do usuário
 * @param validNextFens - Array de FENs válidos após o movimento
 * @param move - Movimento do usuário (from, to)
 * @returns true se movimento é válido
 */
export function validateMove(
  currentFen: string,
  userColor: 'white' | 'black',
  validNextFens: string[],
  move: { from: string; to: string; promotion?: string }
): { isValid: boolean; resultingFen?: string } {
  try {
    const game = new Chess(currentFen);

    // Verifica se é a vez do usuário
    const currentTurn = game.turn();
    const expectedTurn = userColor === 'white' ? 'w' : 'b';

    if (currentTurn !== expectedTurn) {
      console.warn('⚠️ Não é a vez do usuário');
      return { isValid: false };
    }

    // Tenta fazer o movimento
    const madeMove = game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion || 'q'
    });

    if (!madeMove) {
      return { isValid: false };
    }

    const resultingFen = game.fen();

    // Verifica se o FEN resultante está na lista de FENs válidos
    const isValid = validNextFens.includes(resultingFen);

    return {
      isValid,
      resultingFen
    };
  } catch (error) {
    console.error('Erro ao validar movimento:', error);
    return { isValid: false };
  }
}

/**
 * Extrai informações de uma posição FEN
 */
export interface FenInfo {
  turn: 'w' | 'b';
  turnColor: 'white' | 'black';
  moveNumber: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isGameOver: boolean;
}

/**
 * Extrai informações úteis de um FEN
 */
export function parseFenInfo(fen: string): FenInfo {
  const game = new Chess(fen);

  return {
    turn: game.turn(),
    turnColor: game.turn() === 'w' ? 'white' : 'black',
    moveNumber: parseInt(fen.split(' ')[5]) || 1,
    isCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isGameOver: game.isGameOver()
  };
}

/**
 * Calcula a orientação correta do tabuleiro
 * A orientação deve SEMPRE ser a cor do usuário, não muda baseado em quem é a vez
 * @param userColor - Cor que o usuário joga
 * @returns Orientação do tabuleiro (sempre a cor do usuário)
 */
export function getBoardOrientation(
  userColor: 'white' | 'black'
): 'white' | 'black' {
  return userColor;
}

/**
 * Formata tempo decorrido em formato legível
 * @param seconds - Segundos decorridos
 * @returns String formatada (ex: "1:23" ou "01:23:45")
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
