import { useState, useEffect, useCallback, useRef } from 'react';
import { getStockfish } from '../services/StockfishService';
import type { StockfishAnalysis } from '../services/StockfishService';

interface UseStockfishReturn {
  isReady: boolean;
  isAnalyzing: boolean;
  currentEvaluation: number; // Com smoothing aplicado
  analyze: (fen: string, depth?: number) => Promise<StockfishAnalysis | null>;
  setSkillLevel: (level: number) => void;
  stop: () => void;
}

/**
 * Debounce hook para atrasar atualizações
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle função para limitar chamadas
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Garante que a última chamada sempre execute
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Aplica hysteresis para evitar mudanças pequenas
 */
function applyHysteresis(
  newValue: number,
  currentValue: number,
  threshold: number = 20 // 0.2 pawns
): number {
  const diff = Math.abs(newValue - currentValue);
  if (diff < threshold) {
    return currentValue;
  }
  return newValue;
}

/**
 * Hook do Stockfish com smoothing e otimizações anti-dancing
 * Implementa moving average, throttling, e hysteresis
 */
export const useStockfish = (): UseStockfishReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(0);

  const stockfish = getStockfish();

  // Histórico para moving average (janela de 3)
  const evalHistoryRef = useRef<number[]>([]);

  // Último valor reportado (para hysteresis)
  const lastReportedRef = useRef<number>(0);

  useEffect(() => {
    // Wait for Stockfish to be ready
    const checkReady = async () => {
      await stockfish.waitForReady();
      setIsReady(true);
    };

    checkReady();

    // Cleanup on unmount
    return () => {
      stockfish.stop();
    };
  }, [stockfish]);

  /**
   * Atualiza avaliação com smoothing (moving average + hysteresis)
   */
  const updateEvaluationSmooth = useCallback((newEval: number) => {
    // Aplicar hysteresis
    const hysteresisValue = applyHysteresis(newEval, lastReportedRef.current, 20);

    // Adicionar ao histórico
    evalHistoryRef.current.push(hysteresisValue);

    // Manter apenas últimos 3 valores
    if (evalHistoryRef.current.length > 3) {
      evalHistoryRef.current.shift();
    }

    // Calcular média móvel
    const average =
      evalHistoryRef.current.reduce((sum, val) => sum + val, 0) /
      evalHistoryRef.current.length;

    lastReportedRef.current = average;
    setCurrentEvaluation(average);
  }, []);

  /**
   * Throttled update - máximo 10 updates/segundo
   */
  const throttledUpdate = useRef(
    throttle((evaluation: number) => {
      updateEvaluationSmooth(evaluation);
    }, 150)
  ).current;

  /**
   * Analisa uma posição com smoothing em tempo real
   */
  const analyze = useCallback(
    async (fen: string, depth: number = 20): Promise<StockfishAnalysis | null> => {
      if (!isReady) {
        console.warn('⚠️ Stockfish not ready yet');
        return null;
      }

      setIsAnalyzing(true);

      try {
        // Callback de progresso com throttling
        const onProgress = (evaluation: number) => {
          throttledUpdate(evaluation);
        };

        const result = await stockfish.analyze(fen, depth, onProgress);

        // Atualização final (sempre executa)
        updateEvaluationSmooth(result.evaluation);

        return result;
      } catch (error) {
        console.error('❌ Analysis failed:', error);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isReady, stockfish, throttledUpdate, updateEvaluationSmooth]
  );

  const setSkillLevel = useCallback(
    (level: number) => {
      if (isReady) {
        stockfish.setSkillLevel(level);
      }
    },
    [isReady, stockfish]
  );

  const stop = useCallback(() => {
    stockfish.stop();
    setIsAnalyzing(false);
  }, [stockfish]);

  return {
    isReady,
    isAnalyzing,
    currentEvaluation, // Valor com smoothing
    analyze,
    setSkillLevel,
    stop
  };
};

/**
 * Hook especializado para barra de avaliação
 * Adiciona debouncing de mudanças de FEN
 */
export const useEvaluationBar = (fen: string, enabled: boolean = true) => {
  const { isReady, isAnalyzing, currentEvaluation, analyze } = useStockfish();

  // Debounce FEN changes (300ms)
  const debouncedFen = useDebounce(fen, 300);

  useEffect(() => {
    if (!enabled || !isReady || !debouncedFen) return;

    analyze(debouncedFen, 20);
  }, [debouncedFen, enabled, isReady, analyze]);

  return {
    evaluation: currentEvaluation,
    isEvaluating: isAnalyzing,
    isReady
  };
};

export default useStockfish;
