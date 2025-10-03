export interface Puzzle {
  id: string;
  fenBefore: string; // Posição antes do erro
  blunderMove: string; // O movimento ruim jogado
  solution: string; // O melhor movimento (solução)
  evaluation: number; // Centipawns perdidos
  moveNumber: number;
  color: 'white' | 'black';
  dateCreated: string;
  attempts?: number;
  solved?: boolean;
  lastAttempt?: string;
}

export interface PuzzleStats {
  totalPuzzles: number;
  solvedPuzzles: number;
  averageAttempts: number;
  successRate: number;
}