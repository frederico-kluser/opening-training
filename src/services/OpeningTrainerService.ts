import TypeStorage from '../types/TypeStorage';

interface TrainingStats {
  totalMoves: number;
  correctMoves: number;
  incorrectMoves: number;
  streak: number;
  maxStreak: number;
  sessionsCompleted: number;
  lastTrainingDate: string;
  averageAccuracy: number;
}

interface TrainingSession {
  variant: string;
  startedAt: Date;
  moves: number;
  correctMoves: number;
  incorrectMoves: number;
}

class OpeningTrainerService {
  private readonly STATS_KEY = 'opening-training-stats';
  private readonly SESSION_KEY = 'opening-training-session';

  /**
   * Obtém as estatísticas globais de treinamento
   */
  getStats(): TrainingStats {
    const statsJson = localStorage.getItem(this.STATS_KEY);
    if (!statsJson) {
      return this.createDefaultStats();
    }
    return JSON.parse(statsJson);
  }

  /**
   * Cria estatísticas padrão
   */
  private createDefaultStats(): TrainingStats {
    return {
      totalMoves: 0,
      correctMoves: 0,
      incorrectMoves: 0,
      streak: 0,
      maxStreak: 0,
      sessionsCompleted: 0,
      lastTrainingDate: new Date().toISOString(),
      averageAccuracy: 0
    };
  }

  /**
   * Salva as estatísticas
   */
  saveStats(stats: TrainingStats): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  /**
   * Registra um movimento correto
   */
  recordCorrectMove(streak: number): void {
    const stats = this.getStats();
    stats.totalMoves++;
    stats.correctMoves++;
    stats.streak = streak;
    stats.maxStreak = Math.max(stats.maxStreak, streak);
    stats.averageAccuracy = (stats.correctMoves / stats.totalMoves) * 100;
    stats.lastTrainingDate = new Date().toISOString();
    this.saveStats(stats);
  }

  /**
   * Registra um movimento incorreto
   */
  recordIncorrectMove(): void {
    const stats = this.getStats();
    stats.totalMoves++;
    stats.incorrectMoves++;
    stats.streak = 0;
    stats.averageAccuracy = (stats.correctMoves / stats.totalMoves) * 100;
    stats.lastTrainingDate = new Date().toISOString();
    this.saveStats(stats);
  }

  /**
   * Completa uma sessão de treinamento
   */
  completeSession(): void {
    const stats = this.getStats();
    stats.sessionsCompleted++;
    this.saveStats(stats);
  }

  /**
   * Gera uma sequência aleatória de posições para treinar
   * Usa Fisher-Yates shuffle para garantir aleatorização verdadeira
   */
  generateTrainingSequence(data: TypeStorage, variant: string, length: number = 20): string[] {
    if (!data[variant]) return [];

    const fens = Object.keys(data[variant]);

    // Filtra apenas posições que têm próximas variantes (onde o usuário precisa jogar)
    const trainablePositions = fens.filter(fen => {
      const position = data[variant][fen];
      return position.nextFen && position.nextFen.length > 0;
    });

    // Fisher-Yates shuffle para aleatorização verdadeira
    const shuffled = [...trainablePositions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Se temos menos posições que o solicitado, repete o array embaralhado
    if (shuffled.length < length && shuffled.length > 0) {
      const result = [];
      while (result.length < length) {
        // Re-embaralha para cada ciclo
        const reShuffled = [...shuffled];
        for (let i = reShuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [reShuffled[i], reShuffled[j]] = [reShuffled[j], reShuffled[i]];
        }
        result.push(...reShuffled);
      }
      return result.slice(0, length);
    }

    return shuffled.slice(0, Math.min(length, shuffled.length));
  }

  /**
   * Verifica se um movimento é válido para uma posição
   */
  isValidMove(
    data: TypeStorage,
    variant: string,
    currentFen: string,
    nextFen: string
  ): boolean {
    const position = data[variant]?.[currentFen];
    if (!position) return false;

    return position.nextFen.includes(nextFen);
  }

  /**
   * Obtém as variantes válidas para uma posição
   */
  getValidMoves(
    data: TypeStorage,
    variant: string,
    currentFen: string
  ): string[] {
    const position = data[variant]?.[currentFen];
    if (!position) return [];

    return position.nextFen || [];
  }

  /**
   * Obtém o comentário de uma posição
   */
  getPositionComment(
    data: TypeStorage,
    variant: string,
    fen: string
  ): string {
    return data[variant]?.[fen]?.comment || '';
  }

  /**
   * Salva a sessão atual
   */
  saveSession(session: TrainingSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Carrega a sessão salva
   */
  loadSession(): TrainingSession | null {
    const sessionJson = localStorage.getItem(this.SESSION_KEY);
    if (!sessionJson) return null;

    const session = JSON.parse(sessionJson);
    session.startedAt = new Date(session.startedAt);
    return session;
  }

  /**
   * Limpa a sessão salva
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Reseta todas as estatísticas
   */
  resetStats(): void {
    localStorage.removeItem(this.STATS_KEY);
  }
}

export default new OpeningTrainerService();