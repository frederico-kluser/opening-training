import { Chess } from 'chess.js';

/**
 * Converte notação UCI para notação SAN (Standard Algebraic Notation)
 */
export const convertUCItoSAN = (uciMove: string, fenPosition: string): string => {
  const tempGame = new Chess(fenPosition);
  const from = uciMove.substring(0, 2);
  const to = uciMove.substring(2, 4);
  const promotion = uciMove.substring(4, 5);

  try {
    const move = tempGame.move({
      from,
      to,
      promotion: promotion || undefined
    });
    return move ? move.san : uciMove;
  } catch {
    return uciMove;
  }
};

/**
 * Valida e executa um movimento no tabuleiro
 */
export const executeMove = (
  game: Chess,
  sourceSquare: string,
  targetSquare: string,
  promotion = 'q'
) => {
  try {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion
    });
    return move;
  } catch {
    return null;
  }
};

/**
 * Converte movimento para notação UCI
 */
export const moveToUCI = (
  sourceSquare: string,
  targetSquare: string,
  promotion?: string
): string => {
  return sourceSquare + targetSquare + (promotion || '');
};