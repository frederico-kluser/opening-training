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
 * Sistema de rastreamento de frequência de posições (localStorage)
 */
const POSITION_FREQUENCY_KEY = 'opening-trainer-position-frequency';

interface PositionFrequency {
  [fen: string]: number; // FEN -> número de vezes mostrada
}

function getPositionFrequencies(): PositionFrequency {
  try {
    const stored = localStorage.getItem(POSITION_FREQUENCY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePositionFrequencies(frequencies: PositionFrequency): void {
  try {
    localStorage.setItem(POSITION_FREQUENCY_KEY, JSON.stringify(frequencies));
  } catch (error) {
    console.warn('⚠️ Não foi possível salvar frequências de posições:', error);
  }
}

export function recordPositionShown(fen: string): void {
  const frequencies = getPositionFrequencies();
  frequencies[fen] = (frequencies[fen] || 0) + 1;
  savePositionFrequencies(frequencies);
}

/**
 * Reseta todas as estatísticas de frequência de posições
 * Útil para "começar do zero" o balanceamento
 */
export function resetPositionFrequencies(): void {
  try {
    localStorage.removeItem(POSITION_FREQUENCY_KEY);
    console.log('🔄 Estatísticas de frequência resetadas');
  } catch (error) {
    console.warn('⚠️ Não foi possível resetar frequências:', error);
  }
}

/**
 * Obtém estatísticas sobre o balanceamento de posições
 */
export function getBalancingStats(): {
  totalPositionsTracked: number;
  mostSeenPosition: { fen: string; count: number } | null;
  leastSeenPosition: { fen: string; count: number } | null;
  averageViews: number;
} {
  const frequencies = getPositionFrequencies();
  const entries = Object.entries(frequencies);

  if (entries.length === 0) {
    return {
      totalPositionsTracked: 0,
      mostSeenPosition: null,
      leastSeenPosition: null,
      averageViews: 0
    };
  }

  const counts = entries.map(([_, count]) => count);
  const total = counts.reduce((sum, c) => sum + c, 0);

  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    totalPositionsTracked: entries.length,
    mostSeenPosition: { fen: sorted[0][0], count: sorted[0][1] },
    leastSeenPosition: { fen: sorted[sorted.length - 1][0], count: sorted[sorted.length - 1][1] },
    averageViews: total / entries.length
  };
}

/**
 * Sorteia posições usando sistema de pesos balanceados
 * Posições menos vistas têm maior probabilidade de serem escolhidas
 */
function weightedRandomSelection(
  fens: string[],
  frequencies: PositionFrequency,
  count: number
): string[] {
  const selected: string[] = [];
  const available = [...fens];

  for (let i = 0; i < count && available.length > 0; i++) {
    // Calcula pesos: quanto menos vezes vista, maior o peso
    // Fórmula: peso = 1 / (frequência + 1)
    const weights = available.map(fen => {
      const frequency = frequencies[fen] || 0;
      return 1 / (frequency + 1);
    });

    // Soma total dos pesos
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Sorteia baseado nos pesos
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < weights.length; j++) {
      random -= weights[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    // Adiciona à seleção e remove dos disponíveis (evita repetição na mesma sessão)
    selected.push(available[selectedIndex]);
    available.splice(selectedIndex, 1);
  }

  return selected;
}

/**
 * Gera sequência de posições de treinamento com contexto e balanceamento inteligente
 *
 * MELHORIAS v2.1.0:
 * - ✅ Filtra apenas posições da cor do usuário
 * - ✅ Balanceia baseado em frequência histórica
 * - ✅ Evita repetição excessiva da mesma posição
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

    // ✅ Verificar se é a vez da cor do usuário jogar
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

  // ⚖️ BALANCEAMENTO INTELIGENTE: Obtém frequências históricas
  const frequencies = getPositionFrequencies();

  // Mostrar estatísticas de balanceamento
  const avgFrequency = trainablePositions.reduce((sum, fen) => sum + (frequencies[fen] || 0), 0) / trainablePositions.length;
  console.log(`⚖️ Balanceamento: média de ${avgFrequency.toFixed(1)} visualizações por posição`);

  // Sorteia posições com pesos balanceados
  let selectedFens: string[] = [];

  if (trainablePositions.length >= count) {
    // Temos posições suficientes: usa sorteio balanceado
    selectedFens = weightedRandomSelection(trainablePositions, frequencies, count);
  } else {
    // Precisamos repetir algumas posições
    const iterations = Math.ceil(count / trainablePositions.length);

    for (let i = 0; i < iterations; i++) {
      const batch = weightedRandomSelection(trainablePositions, frequencies, trainablePositions.length);
      selectedFens.push(...batch);
    }

    selectedFens = selectedFens.slice(0, count);
  }

  console.log(`🎲 ${selectedFens.length} posições sorteadas com balanceamento`);

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
