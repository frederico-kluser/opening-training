/**
 * Utilitários para conversão e formatação de avaliações de xadrez
 */

/**
 * Converte centipawns para porcentagem de vitória (0-100)
 * Baseado na fórmula do Lichess
 * @param centipawns - Avaliação em centipawns (positivo = brancas, negativo = pretas)
 * @returns Porcentagem de vitória para as brancas (0-100)
 */
export function centipawnsToWinPercentage(centipawns: number): number {
  // Fórmula do Lichess: Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const winProbability = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);

  // Clamp entre 0 e 100
  return Math.max(0, Math.min(100, winProbability));
}

/**
 * Formata avaliação para display (+2.5, -1.3, M#3)
 * @param centipawns - Avaliação em centipawns
 * @returns String formatada
 */
export function formatEvaluation(centipawns: number): string {
  // Detecta mate
  if (Math.abs(centipawns) >= 100000) {
    const mateIn = centipawns > 0 ? 100000 - centipawns : -100000 + centipawns;
    return mateIn > 0 ? `M#${Math.abs(mateIn)}` : `-M#${Math.abs(mateIn)}`;
  }

  // Converte centipawns para pawns (divide por 100)
  const pawns = centipawns / 100;

  // Formata com sinal
  if (pawns > 0) {
    return `+${pawns.toFixed(1)}`;
  } else if (pawns < 0) {
    return pawns.toFixed(1);
  } else {
    return '0.0';
  }
}

/**
 * Determina a cor da avaliação (para temas claros/escuros)
 * @param centipawns - Avaliação em centipawns
 * @returns 'white' | 'black' | 'equal'
 */
export function getEvaluationColor(centipawns: number): 'white' | 'black' | 'equal' {
  if (centipawns > 50) return 'white'; // > 0.5 pawns
  if (centipawns < -50) return 'black';
  return 'equal';
}
