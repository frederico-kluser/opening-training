import TypeStorage from '../types/TypeStorage';

/**
 * Utilitários para sincronização de anotações entre FENs duplicados
 *
 * Em transposições, o mesmo FEN pode aparecer em diferentes caminhos da árvore.
 * Esta biblioteca garante que anotações sejam sincronizadas entre todas as ocorrências.
 */

/**
 * Busca todas as ocorrências de um FEN em uma variante
 *
 * @param variant - Nome da variante
 * @param targetFen - FEN a ser buscado
 * @param storage - Dados completos do TypeStorage
 * @returns Array de FENs que são iguais ao targetFen (incluindo ele mesmo)
 */
export function findDuplicateFens(
  variant: string,
  targetFen: string,
  storage: TypeStorage
): string[] {
  if (!storage[variant]) return [targetFen];

  const positions = storage[variant];
  const duplicates: string[] = [];

  // Normaliza o FEN para comparação (remove contadores de movimentos que podem variar)
  const normalizedTarget = normalizeFen(targetFen);

  Object.keys(positions).forEach(fen => {
    if (normalizeFen(fen) === normalizedTarget) {
      duplicates.push(fen);
    }
  });

  return duplicates.length > 0 ? duplicates : [targetFen];
}

/**
 * Normaliza FEN para comparação
 * Remove os últimos dois campos (halfmove e fullmove) que podem variar em transposições
 *
 * Exemplo:
 * "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 * vira
 * "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"
 */
function normalizeFen(fen: string): string {
  const parts = fen.split(' ');
  // Mantém apenas: posição, turno, castling, en passant
  return parts.slice(0, 4).join(' ');
}

/**
 * Busca comentário de qualquer ocorrência do FEN na árvore
 * Se o FEN atual não tem comentário, mas existe outro igual com comentário, retorna aquele
 *
 * @param variant - Nome da variante
 * @param targetFen - FEN a ser verificado
 * @param storage - Dados completos do TypeStorage
 * @returns Comentário encontrado ou string vazia
 */
export function findCommentForFen(
  variant: string,
  targetFen: string,
  storage: TypeStorage
): string {
  const duplicates = findDuplicateFens(variant, targetFen, storage);

  // Busca o primeiro comentário não-vazio
  for (const fen of duplicates) {
    const comment = storage[variant][fen]?.comment;
    if (comment && comment.trim().length > 0) {
      return comment;
    }
  }

  return '';
}

/**
 * Sincroniza comentário para todas as ocorrências do FEN na árvore
 * Quando um comentário é editado, atualiza todos os FENs iguais
 *
 * @param variant - Nome da variante
 * @param targetFen - FEN que teve comentário editado
 * @param newComment - Novo comentário
 * @param storage - Dados completos do TypeStorage
 * @returns TypeStorage atualizado
 */
export function syncCommentToAllFens(
  variant: string,
  targetFen: string,
  newComment: string,
  storage: TypeStorage
): TypeStorage {
  const duplicates = findDuplicateFens(variant, targetFen, storage);
  const updatedStorage = { ...storage };

  // Atualiza comentário em todas as ocorrências
  duplicates.forEach(fen => {
    if (updatedStorage[variant][fen]) {
      updatedStorage[variant][fen] = {
        ...updatedStorage[variant][fen],
        comment: newComment
      };
    }
  });

  console.log(`📝 Comentário sincronizado em ${duplicates.length} FEN(s) duplicados:`, {
    targetFen: targetFen.substring(0, 30) + '...',
    comment: newComment.substring(0, 50) + (newComment.length > 50 ? '...' : ''),
    duplicates: duplicates.map(f => f.substring(0, 30) + '...')
  });

  return updatedStorage;
}

/**
 * Popula comentário vazio com comentário de FEN duplicado
 * Se o FEN atual não tem comentário, busca na árvore e copia se encontrar
 *
 * @param variant - Nome da variante
 * @param targetFen - FEN a ser populado
 * @param storage - Dados completos do TypeStorage
 * @returns [TypeStorage atualizado, comentário encontrado]
 */
export function populateEmptyComment(
  variant: string,
  targetFen: string,
  storage: TypeStorage
): [TypeStorage, string] {
  if (!storage[variant][targetFen]) {
    return [storage, ''];
  }

  const currentComment = storage[variant][targetFen].comment;

  // Se já tem comentário, não faz nada
  if (currentComment && currentComment.trim().length > 0) {
    return [storage, currentComment];
  }

  // Busca comentário em outros FENs iguais
  const foundComment = findCommentForFen(variant, targetFen, storage);

  if (foundComment && foundComment.trim().length > 0) {
    const updatedStorage = {
      ...storage,
      [variant]: {
        ...storage[variant],
        [targetFen]: {
          ...storage[variant][targetFen],
          comment: foundComment
        }
      }
    };

    console.log(`✅ Comentário populado automaticamente de FEN duplicado:`, {
      targetFen: targetFen.substring(0, 30) + '...',
      comment: foundComment.substring(0, 50) + (foundComment.length > 50 ? '...' : '')
    });

    return [updatedStorage, foundComment];
  }

  return [storage, ''];
}

/**
 * Verifica se existem FENs duplicados em uma variante
 * Útil para debug e estatísticas
 *
 * @param variant - Nome da variante
 * @param storage - Dados completos do TypeStorage
 * @returns Mapa de FEN normalizado → array de FENs completos
 */
export function findAllDuplicates(
  variant: string,
  storage: TypeStorage
): Map<string, string[]> {
  if (!storage[variant]) return new Map();

  const positions = storage[variant];
  const fenMap = new Map<string, string[]>();

  Object.keys(positions).forEach(fen => {
    const normalized = normalizeFen(fen);
    const existing = fenMap.get(normalized) || [];
    existing.push(fen);
    fenMap.set(normalized, existing);
  });

  // Retorna apenas FENs que têm duplicatas (mais de 1 ocorrência)
  const duplicatesOnly = new Map<string, string[]>();
  fenMap.forEach((fens, normalized) => {
    if (fens.length > 1) {
      duplicatesOnly.set(normalized, fens);
    }
  });

  return duplicatesOnly;
}

/**
 * Gera relatório de transposições em uma variante
 *
 * @param variant - Nome da variante
 * @param storage - Dados completos do TypeStorage
 */
export function logTranspositionsReport(
  variant: string,
  storage: TypeStorage
): void {
  const duplicates = findAllDuplicates(variant, storage);

  if (duplicates.size === 0) {
    console.log(`ℹ️ Nenhuma transposição encontrada em "${variant}"`);
    return;
  }

  console.log(`🔀 Relatório de Transposições - "${variant}"`);
  console.log(`   Total de posições únicas com transposições: ${duplicates.size}`);
  console.log('');

  duplicates.forEach((fens, normalized) => {
    console.log(`📍 Posição aparece ${fens.length}x:`);
    console.log(`   FEN normalizado: ${normalized}`);

    fens.forEach((fen, index) => {
      const position = storage[variant][fen];
      const hasComment = position?.comment && position.comment.trim().length > 0;
      console.log(`   ${index + 1}. ${fen.substring(0, 40)}...`);
      console.log(`      Comentário: ${hasComment ? '✅' : '❌'} ${position?.comment || '(vazio)'}`);
      console.log(`      Próximos: ${position?.nextFen?.length || 0} variante(s)`);
    });

    console.log('');
  });
}
