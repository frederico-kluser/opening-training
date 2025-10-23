import { useState, useEffect, useCallback } from 'react';
import { getStockfish } from '../services/StockfishService';

interface StockfishAnalysis {
  bestMove: string;
  evaluation: number;
  depth: number;
  pv: string[];
}

interface UseStockfishReturn {
  isReady: boolean;
  isAnalyzing: boolean;
  analyze: (fen: string, depth?: number) => Promise<StockfishAnalysis | null>;
  setSkillLevel: (level: number) => void;
  stop: () => void;
}

export const useStockfish = (): UseStockfishReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const stockfish = getStockfish();

  useEffect(() => {
    // Wait for Stockfish to be ready
    const checkReady = async () => {
      await stockfish.waitForReady();
      setIsReady(true);
    };

    checkReady();

    // Cleanup on unmount
    return () => {
      // Don't quit the singleton, just stop any ongoing analysis
      stockfish.stop();
    };
  }, [stockfish]);

  const analyze = useCallback(async (fen: string, depth: number = 20): Promise<StockfishAnalysis | null> => {
    if (!isReady) {
      console.warn('Stockfish not ready yet');
      return null;
    }

    setIsAnalyzing(true);
    try {
      const result = await stockfish.analyze(fen, depth);
      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isReady, stockfish]);

  const setSkillLevel = useCallback((level: number) => {
    if (isReady) {
      stockfish.setSkillLevel(level);
    }
  }, [isReady, stockfish]);

  const stop = useCallback(() => {
    stockfish.stop();
    setIsAnalyzing(false);
  }, [stockfish]);

  return {
    isReady,
    isAnalyzing,
    analyze,
    setSkillLevel,
    stop
  };
};

export default useStockfish;