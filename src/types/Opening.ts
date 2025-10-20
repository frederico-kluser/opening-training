import TypeStorage from './TypeStorage';

/**
 * Interface expandida para aberturas com metadados
 * v2.0.0 - Suporta escolha de cor e gerenciamento individual
 */
export interface Opening {
  id: string;
  name: string;                           // Nome da abertura (ex: "Sicilian Defense")
  description?: string;                   // Descrição opcional
  color: 'white' | 'black';              // Cor que o usuário joga nesta abertura
  dateCreated: string;                   // Data de criação
  lastModified: string;                  // Última modificação
  lastPracticed?: string;                // Última vez que treinou
  positions: {                           // Posições da abertura
    [fen: string]: {
      prevFen: string;
      comment: string;
      nextFen: string[];
    };
  };

  // Estatísticas específicas da abertura
  stats?: {
    totalPositions: number;              // Total de posições treináveis
    correctMoves: number;                // Movimentos corretos
    incorrectMoves: number;              // Movimentos incorretos
    accuracy: number;                    // Taxa de acerto (%)
    timesCompleted: number;              // Vezes que completou sessão
  };
}

/**
 * Opening sem ID (usado para criação)
 */
export type OpeningInput = Omit<Opening, 'id' | 'dateCreated' | 'lastModified'>;

/**
 * Estrutura de armazenamento legada
 * Mantida para compatibilidade com sistema antigo
 */
export interface LegacyOpeningStorage {
  [variantName: string]: {
    [fen: string]: {
      prevFen: string;
      comment: string;
      nextFen: string[];
    };
  };
}

/**
 * Converte TypeStorage legado para formato Opening
 */
export function convertLegacyToOpening(
  variantName: string,
  legacyData: TypeStorage,
  color: 'white' | 'black' = 'white'
): Opening {
  return {
    id: generateOpeningId(variantName),
    name: variantName,
    color,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    positions: legacyData[variantName] || {},
    stats: {
      totalPositions: Object.keys(legacyData[variantName] || {})
        .filter(fen => {
          const pos = legacyData[variantName][fen];
          return pos.nextFen && pos.nextFen.length > 0;
        }).length,
      correctMoves: 0,
      incorrectMoves: 0,
      accuracy: 0,
      timesCompleted: 0
    }
  };
}

/**
 * Converte Opening para TypeStorage legado
 */
export function convertOpeningToLegacy(opening: Opening): TypeStorage {
  return {
    [opening.name]: opening.positions
  };
}

/**
 * Gera ID único para abertura baseado no nome
 */
export function generateOpeningId(name: string): string {
  const timestamp = Date.now();
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${sanitized}-${timestamp}`;
}
