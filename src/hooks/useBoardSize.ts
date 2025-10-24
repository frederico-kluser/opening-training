import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar o tamanho do tabuleiro de xadrez
 *
 * Fornece controles de zoom com 7 níveis de tamanho:
 * - Extra pequeno: 350px
 * - Pequeno: 400px
 * - Médio: 500px (padrão)
 * - Grande: 600px
 * - Extra grande: 700px
 * - 2XL: 850px
 * - 3XL: 1000px
 *
 * O tamanho selecionado é persistido no localStorage
 */

export type BoardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

const BOARD_SIZES: Record<BoardSize, number> = {
  xs: 350,
  sm: 400,
  md: 500, // padrão
  lg: 600,
  xl: 700,
  '2xl': 850,
  '3xl': 1000,
};

const SIZE_ORDER: BoardSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const DEFAULT_SIZE: BoardSize = 'md';
const STORAGE_KEY = 'chess-board-size';

export interface UseBoardSizeReturn {
  /** Tamanho atual em pixels */
  boardSize: number;
  /** Identificador do tamanho (xs, sm, md, lg, xl) */
  sizeKey: BoardSize;
  /** Aumenta o tamanho do tabuleiro */
  zoomIn: () => void;
  /** Diminui o tamanho do tabuleiro */
  zoomOut: () => void;
  /** Reseta para o tamanho padrão */
  resetSize: () => void;
  /** Verifica se pode aumentar mais */
  canZoomIn: boolean;
  /** Verifica se pode diminuir mais */
  canZoomOut: boolean;
  /** String CSS para usar como width do container */
  boardWidth: string;
}

/**
 * Hook customizado para controle de zoom do tabuleiro
 */
export default function useBoardSize(): UseBoardSizeReturn {
  // Carrega tamanho inicial do localStorage ou usa padrão
  const [sizeKey, setSizeKey] = useState<BoardSize>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SIZE_ORDER.includes(stored as BoardSize)) {
        return stored as BoardSize;
      }
    } catch (error) {
      console.warn('Erro ao carregar tamanho do tabuleiro do localStorage:', error);
    }
    return DEFAULT_SIZE;
  });

  // Persiste mudanças no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, sizeKey);
      console.log(`🔍 Tamanho do tabuleiro alterado para: ${sizeKey} (${BOARD_SIZES[sizeKey]}px)`);
    } catch (error) {
      console.warn('Erro ao salvar tamanho do tabuleiro no localStorage:', error);
    }
  }, [sizeKey]);

  const zoomIn = useCallback(() => {
    setSizeKey((current) => {
      const currentIndex = SIZE_ORDER.indexOf(current);
      if (currentIndex < SIZE_ORDER.length - 1) {
        return SIZE_ORDER[currentIndex + 1];
      }
      return current;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setSizeKey((current) => {
      const currentIndex = SIZE_ORDER.indexOf(current);
      if (currentIndex > 0) {
        return SIZE_ORDER[currentIndex - 1];
      }
      return current;
    });
  }, []);

  const resetSize = useCallback(() => {
    setSizeKey(DEFAULT_SIZE);
  }, []);

  const currentIndex = SIZE_ORDER.indexOf(sizeKey);
  const canZoomIn = currentIndex < SIZE_ORDER.length - 1;
  const canZoomOut = currentIndex > 0;
  const boardSize = BOARD_SIZES[sizeKey];

  // String CSS que respeita o responsivo mas usa o tamanho escolhido como máximo
  const boardWidth = `min(${boardSize}px, 90vw, 70vh)`;

  return {
    boardSize,
    sizeKey,
    zoomIn,
    zoomOut,
    resetSize,
    canZoomIn,
    canZoomOut,
    boardWidth,
  };
}
