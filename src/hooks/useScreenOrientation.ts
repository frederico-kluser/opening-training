import { useState, useEffect } from 'react';

/**
 * Hook para detectar a orientação da tela
 *
 * Retorna 'portrait' quando a altura é maior que a largura (tela mais alta que larga)
 * Retorna 'landscape' quando a largura é maior que a altura (tela mais larga que alta)
 */

export type ScreenOrientation = 'portrait' | 'landscape';

export interface UseScreenOrientationReturn {
  /** Orientação atual da tela */
  orientation: ScreenOrientation;
  /** True se a tela está em modo retrato (mais alta que larga) */
  isPortrait: boolean;
  /** True se a tela está em modo paisagem (mais larga que alta) */
  isLandscape: boolean;
}

export default function useScreenOrientation(): UseScreenOrientationReturn {
  const getOrientation = (): ScreenOrientation => {
    // Se não estiver no browser, retorna landscape como padrão
    if (typeof window === 'undefined') return 'landscape';

    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  };

  const [orientation, setOrientation] = useState<ScreenOrientation>(getOrientation);

  useEffect(() => {
    const handleResize = () => {
      const newOrientation = getOrientation();
      if (newOrientation !== orientation) {
        setOrientation(newOrientation);
        console.log(`📱 Orientação da tela mudou para: ${newOrientation}`);
      }
    };

    // Adiciona listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);

    // Adiciona listener para mudanças de orientação (em dispositivos móveis)
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleResize);
    }

    // Verifica orientação inicial
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, [orientation]);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}
