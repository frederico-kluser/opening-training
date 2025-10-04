import { Puzzle, PuzzleStats } from '../types/Puzzle';
import { v4 as uuidv4 } from 'uuid';

class PuzzleService {
  private readonly STORAGE_KEY = 'chess-puzzles';

  // Obter todos os puzzles
  getPuzzles(): Puzzle[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Salvar puzzles
  savePuzzles(puzzles: Puzzle[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(puzzles));
  }

  // Adicionar novo puzzle
  addPuzzle(puzzle: Omit<Puzzle, 'id' | 'dateCreated'>): Puzzle {
    const newPuzzle: Puzzle = {
      ...puzzle,
      id: uuidv4(),
      dateCreated: new Date().toISOString(),
      attempts: 0,
      solved: false
    };

    const puzzles = this.getPuzzles();
    puzzles.push(newPuzzle);
    this.savePuzzles(puzzles);

    return newPuzzle;
  }

  // Adicionar múltiplos puzzles
  addMultiplePuzzles(newPuzzles: Omit<Puzzle, 'id' | 'dateCreated'>[]): Puzzle[] {
    const puzzles = this.getPuzzles();
    const created: Puzzle[] = [];

    newPuzzles.forEach(puzzle => {
      const newPuzzle: Puzzle = {
        ...puzzle,
        id: uuidv4(),
        dateCreated: new Date().toISOString(),
        attempts: 0,
        solved: false
      };
      puzzles.push(newPuzzle);
      created.push(newPuzzle);
    });

    this.savePuzzles(puzzles);
    return created;
  }

  // Obter puzzle por ID
  getPuzzleById(id: string): Puzzle | undefined {
    const puzzles = this.getPuzzles();
    return puzzles.find(p => p.id === id);
  }

  // Atualizar puzzle
  updatePuzzle(id: string, updates: Partial<Puzzle>): void {
    const puzzles = this.getPuzzles();
    const index = puzzles.findIndex(p => p.id === id);

    if (index !== -1) {
      puzzles[index] = { ...puzzles[index], ...updates };
      this.savePuzzles(puzzles);
    }
  }

  // Marcar puzzle como resolvido
  markSolved(id: string): void {
    this.updatePuzzle(id, {
      solved: true,
      lastAttempt: new Date().toISOString()
    });
  }

  // Registrar tentativa
  recordAttempt(id: string, success: boolean): void {
    const puzzle = this.getPuzzleById(id);
    if (puzzle) {
      this.updatePuzzle(id, {
        attempts: (puzzle.attempts || 0) + 1,
        solved: success || puzzle.solved,
        lastAttempt: new Date().toISOString()
      });
    }
  }

  // Obter puzzles não resolvidos
  getUnsolvedPuzzles(): Puzzle[] {
    return this.getPuzzles().filter(p => !p.solved);
  }

  // Obter puzzles aleatórios (modo Rush)
  getRandomPuzzles(count: number = 20, includesSolved: boolean = false): Puzzle[] {
    const puzzles = includesSolved ? this.getPuzzles() : this.getUnsolvedPuzzles();

    // Fisher-Yates shuffle
    const shuffled = [...puzzles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Se não há puzzles suficientes, repete com re-embaralhamento
    if (shuffled.length < count && shuffled.length > 0) {
      const result = [];
      while (result.length < count) {
        const reShuffled = [...shuffled];
        for (let i = reShuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [reShuffled[i], reShuffled[j]] = [reShuffled[j], reShuffled[i]];
        }
        result.push(...reShuffled);
      }
      return result.slice(0, count);
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Obter puzzles embaralhados (sem repetição)
  getShuffledPuzzles(includesSolved: boolean = false): Puzzle[] {
    const puzzles = includesSolved ? this.getPuzzles() : this.getUnsolvedPuzzles();

    // Fisher-Yates shuffle
    const shuffled = [...puzzles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  // Obter estatísticas
  getStats(): PuzzleStats {
    const puzzles = this.getPuzzles();
    const solved = puzzles.filter(p => p.solved).length;
    const totalAttempts = puzzles.reduce((sum, p) => sum + (p.attempts || 0), 0);

    return {
      totalPuzzles: puzzles.length,
      solvedPuzzles: solved,
      averageAttempts: puzzles.length > 0 ? totalAttempts / puzzles.length : 0,
      successRate: puzzles.length > 0 ? (solved / puzzles.length) * 100 : 0
    };
  }

  // Limpar todos os puzzles
  clearPuzzles(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Exportar puzzles
  exportPuzzles(): string {
    return JSON.stringify(this.getPuzzles(), null, 2);
  }

  // Importar puzzles
  importPuzzles(jsonString: string): void {
    try {
      const puzzles = JSON.parse(jsonString);
      if (Array.isArray(puzzles)) {
        this.savePuzzles(puzzles);
      }
    } catch (error) {
      console.error('Failed to import puzzles:', error);
      throw new Error('Invalid puzzle data format');
    }
  }
}

// Singleton instance
const puzzleService = new PuzzleService();
export default puzzleService;