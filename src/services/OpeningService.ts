import { Opening, OpeningInput, generateOpeningId, convertLegacyToOpening, convertOpeningToLegacy } from '../types/Opening';
import TypeStorage from '../types/TypeStorage';

/**
 * Serviço para gerenciamento CRUD de aberturas
 * v2.0.0 - Sistema expandido com metadados e escolha de cor
 */
class OpeningService {
  private readonly STORAGE_KEY = 'chess-openings-v2';
  private readonly LEGACY_STORAGE_KEY = 'data';

  // ========== CRUD BÁSICO ==========

  /**
   * Obter todas as aberturas
   */
  getOpenings(): Opening[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Salvar todas as aberturas
   */
  private saveOpenings(openings: Opening[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(openings));
  }

  /**
   * Obter abertura por ID
   */
  getOpeningById(id: string): Opening | undefined {
    const openings = this.getOpenings();
    return openings.find(o => o.id === id);
  }

  /**
   * Obter abertura por nome
   */
  getOpeningByName(name: string): Opening | undefined {
    const openings = this.getOpenings();
    return openings.find(o => o.name === name);
  }

  /**
   * Criar nova abertura
   */
  createOpening(input: OpeningInput): Opening {
    const newOpening: Opening = {
      ...input,
      id: generateOpeningId(input.name),
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      stats: input.stats || {
        totalPositions: Object.keys(input.positions)
          .filter(fen => {
            const pos = input.positions[fen];
            return pos.nextFen && pos.nextFen.length > 0;
          }).length,
        correctMoves: 0,
        incorrectMoves: 0,
        accuracy: 0,
        timesCompleted: 0
      }
    };

    const openings = this.getOpenings();
    openings.push(newOpening);
    this.saveOpenings(openings);

    return newOpening;
  }

  /**
   * Atualizar abertura existente
   */
  updateOpening(id: string, updates: Partial<Opening>): Opening | null {
    const openings = this.getOpenings();
    const index = openings.findIndex(o => o.id === id);

    if (index === -1) return null;

    openings[index] = {
      ...openings[index],
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.saveOpenings(openings);
    return openings[index];
  }

  /**
   * Deletar abertura
   */
  deleteOpening(id: string): boolean {
    const openings = this.getOpenings();
    const filtered = openings.filter(o => o.id !== id);

    if (filtered.length === openings.length) return false;

    this.saveOpenings(filtered);
    return true;
  }

  // ========== ESTATÍSTICAS ==========

  /**
   * Registrar movimento correto
   */
  recordCorrectMove(id: string): void {
    const opening = this.getOpeningById(id);
    if (!opening || !opening.stats) return;

    opening.stats.correctMoves++;
    opening.stats.accuracy = this.calculateAccuracy(
      opening.stats.correctMoves,
      opening.stats.incorrectMoves
    );
    opening.lastPracticed = new Date().toISOString();

    this.updateOpening(id, { stats: opening.stats, lastPracticed: opening.lastPracticed });
  }

  /**
   * Registrar movimento incorreto
   */
  recordIncorrectMove(id: string): void {
    const opening = this.getOpeningById(id);
    if (!opening || !opening.stats) return;

    opening.stats.incorrectMoves++;
    opening.stats.accuracy = this.calculateAccuracy(
      opening.stats.correctMoves,
      opening.stats.incorrectMoves
    );
    opening.lastPracticed = new Date().toISOString();

    this.updateOpening(id, { stats: opening.stats, lastPracticed: opening.lastPracticed });
  }

  /**
   * Registrar sessão completa
   */
  recordSessionCompleted(id: string): void {
    const opening = this.getOpeningById(id);
    if (!opening || !opening.stats) return;

    opening.stats.timesCompleted++;
    this.updateOpening(id, { stats: opening.stats });
  }

  /**
   * Calcular taxa de acerto
   */
  private calculateAccuracy(correct: number, incorrect: number): number {
    const total = correct + incorrect;
    return total > 0 ? (correct / total) * 100 : 0;
  }

  /**
   * Resetar estatísticas de uma abertura
   */
  resetStats(id: string): void {
    const opening = this.getOpeningById(id);
    if (!opening) return;

    const stats = {
      totalPositions: opening.stats?.totalPositions || 0,
      correctMoves: 0,
      incorrectMoves: 0,
      accuracy: 0,
      timesCompleted: 0
    };

    this.updateOpening(id, { stats });
  }

  // ========== UTILITÁRIOS DE POSIÇÃO ==========

  /**
   * Obter posições treináveis (que têm nextFen)
   */
  getTrainablePositions(id: string): string[] {
    const opening = this.getOpeningById(id);
    if (!opening) return [];

    return Object.keys(opening.positions).filter(fen => {
      const pos = opening.positions[fen];
      return pos.nextFen && pos.nextFen.length > 0;
    });
  }

  /**
   * Verificar se movimento é válido
   */
  isValidMove(id: string, currentFen: string, nextFen: string): boolean {
    const opening = this.getOpeningById(id);
    if (!opening) return false;

    const position = opening.positions[currentFen];
    if (!position) return false;

    return position.nextFen.includes(nextFen);
  }

  /**
   * Obter movimentos válidos para uma posição
   */
  getValidMoves(id: string, currentFen: string): string[] {
    const opening = this.getOpeningById(id);
    if (!opening) return [];

    const position = opening.positions[currentFen];
    if (!position) return [];

    return position.nextFen || [];
  }

  /**
   * Obter comentário de uma posição
   */
  getPositionComment(id: string, fen: string): string {
    const opening = this.getOpeningById(id);
    if (!opening) return '';

    return opening.positions[fen]?.comment || '';
  }

  // ========== MIGRAÇÃO DE DADOS LEGADOS ==========

  /**
   * Verificar se há dados legados
   */
  hasLegacyData(): boolean {
    const legacyData = localStorage.getItem(this.LEGACY_STORAGE_KEY);
    return !!legacyData;
  }

  /**
   * Obter dados legados
   */
  getLegacyData(): TypeStorage | null {
    const data = localStorage.getItem(this.LEGACY_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Migrar dados legados para novo formato
   * @param defaultColor - Cor padrão para aberturas migradas
   */
  migrateLegacyData(defaultColor: 'white' | 'black' = 'white'): Opening[] {
    const legacyData = this.getLegacyData();
    if (!legacyData) return [];

    const openings = this.getOpenings();
    const migratedOpenings: Opening[] = [];

    // Para cada variante no sistema legado
    Object.keys(legacyData).forEach(variantName => {
      // Verifica se já existe
      const existing = openings.find(o => o.name === variantName);
      if (existing) {
        console.log(`⚠️ Abertura "${variantName}" já existe, pulando...`);
        return;
      }

      // Converte e cria
      const newOpening = convertLegacyToOpening(variantName, legacyData, defaultColor);
      migratedOpenings.push(newOpening);
    });

    // Salva todas de uma vez
    if (migratedOpenings.length > 0) {
      const allOpenings = [...openings, ...migratedOpenings];
      this.saveOpenings(allOpenings);
      console.log(`✅ ${migratedOpenings.length} aberturas migradas com sucesso!`);
    }

    return migratedOpenings;
  }

  /**
   * Exportar abertura como JSON
   */
  exportOpening(id: string): string | null {
    const opening = this.getOpeningById(id);
    if (!opening) return null;

    return JSON.stringify(opening, null, 2);
  }

  /**
   * Exportar abertura no formato legado (TypeStorage)
   */
  exportAsLegacy(id: string): string | null {
    const opening = this.getOpeningById(id);
    if (!opening) return null;

    const legacy = convertOpeningToLegacy(opening);
    return JSON.stringify(legacy, null, 2);
  }

  /**
   * Importar abertura de JSON
   */
  importOpening(jsonString: string): Opening | null {
    try {
      const opening: Opening = JSON.parse(jsonString);

      // Validação básica
      if (!opening.name || !opening.color || !opening.positions) {
        throw new Error('Formato de abertura inválido');
      }

      // Gera novo ID e atualiza datas
      opening.id = generateOpeningId(opening.name);
      opening.dateCreated = new Date().toISOString();
      opening.lastModified = new Date().toISOString();

      // Salva
      const openings = this.getOpenings();
      openings.push(opening);
      this.saveOpenings(openings);

      return opening;
    } catch (error) {
      console.error('Erro ao importar abertura:', error);
      return null;
    }
  }

  /**
   * Limpar todas as aberturas
   */
  clearAllOpenings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ========== COMPATIBILIDADE COM SISTEMA LEGADO ==========

  /**
   * Obter abertura como TypeStorage (para compatibilidade)
   * Usado para manter componentes legados funcionando
   */
  getOpeningAsLegacyStorage(id: string): TypeStorage | null {
    const opening = this.getOpeningById(id);
    if (!opening) return null;

    return convertOpeningToLegacy(opening);
  }
}

// Singleton instance
const openingService = new OpeningService();
export default openingService;
