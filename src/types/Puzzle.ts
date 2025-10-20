export interface Puzzle {
  // ========== DADOS BÁSICOS (mantidos) ==========
  id: string;
  fenBefore: string; // Posição antes do erro
  fenContext?: string; // Posição um movimento antes (para contexto)
  blunderMove: string; // O movimento ruim jogado
  solution: string; // O melhor movimento (solução)
  evaluation: number; // Centipawns perdidos (cpLoss - compatibilidade)
  moveNumber: number;
  color: 'white' | 'black';
  dateCreated: string;
  attempts?: number;
  solved?: boolean;
  lastAttempt?: string;

  // ========== AVALIAÇÕES EXPANDIDAS (v2.0.0) ==========
  evalContext?: number;      // Avaliação do fenContext
  evalBefore?: number;       // Avaliação ANTES do blunder
  evalAfter?: number;        // Avaliação DEPOIS do blunder
  evalBestMove?: number;     // Avaliação se jogasse o melhor movimento

  // ========== PERDA DETALHADA ==========
  cpLoss?: number;           // Mesmo que 'evaluation' (alias explícito)
  cpLossCategory?: 'small' | 'medium' | 'large' | 'critical';
  // small: 300-500cp | medium: 500-1000cp | large: 1000-2000cp | critical: >2000cp

  // ========== INFORMAÇÕES DE MATE ==========
  hadMateAvailable?: boolean;  // Tinha mate disponível?
  mateInMoves?: number;        // Mate em X movimentos
  blunderLeadsToMate?: boolean; // Erro leva a mate?
  opponentMateInMoves?: number; // Oponente tem mate em X

  // ========== CONTEXTO TÁTICO ==========
  wasForcedMove?: boolean;     // Era movimento forçado? (xeque, etc)
  hadCheckInPosition?: boolean; // Estava em xeque?

  // ========== TIPO DE ERRO ==========
  errorType?: 'tactical' | 'positional' | 'endgame' | 'opening' | 'missed_mate';
  // tactical: perda material imediata
  // positional: piora de posição gradual
  // endgame: erro em final
  // opening: erro nos primeiros 10 movimentos
  // missed_mate: tinha mate e não viu
}

export interface PuzzleStats {
  totalPuzzles: number;
  solvedPuzzles: number;
  averageAttempts: number;
  successRate: number;
}