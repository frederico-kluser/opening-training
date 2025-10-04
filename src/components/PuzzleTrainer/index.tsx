import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Button, Card, Alert } from 'react-bootstrap';
import puzzleService from '../../services/PuzzleService';
import { Puzzle } from '../../types/Puzzle';
import Gap from '../Gap';
import SessionStats from '../PuzzleSession/SessionStats';
import PuzzleFeedback from '../PuzzleSession/PuzzleFeedback';
import PuzzleControls from '../PuzzleSession/PuzzleControls';
import GlobalStats from '../PuzzleSession/GlobalStats';
import ChessBoardWrapper from '../ChessBoard/ChessBoardWrapper';
import { formatTime, getElapsedTime } from '../../utils/timeUtils';
import { convertUCItoSAN, moveToUCI } from '../../utils/chessUtils';

interface PuzzleSession {
  currentPuzzle: Puzzle | null;
  puzzleIndex: number;
  totalPuzzles: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  maxStreak: number;
  startTime: Date;
  isRushMode: boolean;
  attemptCount: number; // Contador de tentativas para o puzzle atual
}

const PuzzleTrainer: React.FC = () => {
  const [session, setSession] = useState<PuzzleSession>({
    currentPuzzle: null,
    puzzleIndex: 0,
    totalPuzzles: 0,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    maxStreak: 0,
    startTime: new Date(),
    isRushMode: false,
    attemptCount: 0
  });

  const [game, setGame] = useState(new Chess());
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});

  // Carregar puzzles não resolvidos
  useEffect(() => {
    loadPuzzles();
    const timer = setInterval(() => {
      setTimeElapsed(getElapsedTime(session.startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  const loadPuzzles = () => {
    const unsolvedPuzzles = puzzleService.getUnsolvedPuzzles();
    if (unsolvedPuzzles.length === 0) {
      // Se não houver puzzles não resolvidos, carrega todos
      const allPuzzles = puzzleService.getPuzzles();
      setPuzzles(allPuzzles);
      setSession(prev => ({ ...prev, totalPuzzles: allPuzzles.length }));
    } else {
      setPuzzles(unsolvedPuzzles);
      setSession(prev => ({ ...prev, totalPuzzles: unsolvedPuzzles.length }));
    }
  };

  // Carregar puzzle
  useEffect(() => {
    if (puzzles.length > 0 && session.puzzleIndex < puzzles.length) {
      const puzzle = puzzles[session.puzzleIndex];
      const newGame = new Chess(puzzle.fenBefore);
      setGame(newGame);
      setSession(prev => ({ ...prev, currentPuzzle: puzzle, attemptCount: 0 }));
      setBoardOrientation(puzzle.color);
      setShowFeedback(null);
      setShowSolution(false);
      setBackgroundStyle({});
    }
  }, [puzzles, session.puzzleIndex]);


  // Lidar com movimento
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!session.currentPuzzle || showFeedback) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // sempre promove para dama
      });

      if (!move) return false;

      // Converter movimento para notação UCI
      const uciMove = moveToUCI(sourceSquare, targetSquare, move.promotion);

      // Verificar se é a solução correta
      const isCorrect = uciMove === session.currentPuzzle.solution ||
                       move.san === session.currentPuzzle.solution;

      if (isCorrect) {
        handleCorrectMove();
      } else {
        handleIncorrectMove();
        // Desfaz o movimento errado
        game.undo();
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [game, session.currentPuzzle, showFeedback]);

  // Movimento correto
  const handleCorrectMove = () => {
    setShowFeedback('correct');
    setBackgroundStyle({
      backgroundColor: '#90EE90',
      transition: 'background-color 0.5s'
    });

    // Atualizar estatísticas
    setSession(prev => ({
      ...prev,
      correctCount: prev.correctCount + 1,
      streak: prev.streak + 1,
      maxStreak: Math.max(prev.streak + 1, prev.maxStreak)
    }));

    // Marcar puzzle como resolvido
    if (session.currentPuzzle) {
      puzzleService.recordAttempt(session.currentPuzzle.id, true);
      puzzleService.markSolved(session.currentPuzzle.id);
    }

    // Próximo puzzle após 1.5 segundos
    setTimeout(() => {
      nextPuzzle();
    }, 1500);
  };

  // Movimento incorreto
  const handleIncorrectMove = () => {
    // Incrementar contador de tentativas
    const newAttemptCount = session.attemptCount + 1;

    setShowFeedback('incorrect');
    setBackgroundStyle({
      backgroundColor: '#FFB6C1',
      transition: 'background-color 0.5s'
    });

    // Atualizar estatísticas e contador de tentativas
    setSession(prev => ({
      ...prev,
      attemptCount: newAttemptCount,
      incorrectCount: prev.incorrectCount + 1,
      streak: 0 // Reset streak
    }));

    // Registrar tentativa
    if (session.currentPuzzle) {
      puzzleService.recordAttempt(session.currentPuzzle.id, false);
    }

    // Se já errou 3 vezes, vai para o próximo puzzle automaticamente
    if (newAttemptCount >= 3) {
      setTimeout(() => {
        setBackgroundStyle({});
        nextPuzzle();
      }, 1500);
    } else {
      // Limpar feedback após 2 segundos para tentar novamente
      setTimeout(() => {
        setShowFeedback(null);
        setBackgroundStyle({});
      }, 2000);
    }
  };

  // Próximo puzzle
  const nextPuzzle = () => {
    if (session.puzzleIndex < puzzles.length - 1) {
      setSession(prev => ({
        ...prev,
        puzzleIndex: prev.puzzleIndex + 1
      }));
    } else {
      // Fim da sessão
      alert(`Sessão completa!
        Acertos: ${session.correctCount}
        Erros: ${session.incorrectCount}
        Streak máximo: ${session.maxStreak}
        Tempo: ${formatTime(timeElapsed)}`);
      window.location.reload();
    }
  };

  // Pular puzzle
  const skipPuzzle = () => {
    nextPuzzle();
  };

  // Modo Rush - Funcionalidade futura
  // const startRushMode = () => {
  //   setSession(prev => ({
  //     ...prev,
  //     isRushMode: true,
  //     startTime: new Date(),
  //     puzzleIndex: 0,
  //     correctCount: 0,
  //     incorrectCount: 0,
  //     streak: 0,
  //     maxStreak: 0,
  //     attemptCount: 0
  //   }));
  //   loadPuzzles();
  // };

  // Resetar sessão
  const resetSession = () => {
    window.location.reload();
  };

  // Converter solução UCI para SAN
  const getSolutionSAN = () => {
    if (!session.currentPuzzle) return '';
    return convertUCItoSAN(session.currentPuzzle.solution, session.currentPuzzle.fenBefore);
  };

  // Obter estatísticas
  const stats = puzzleService.getStats();

  if (puzzles.length === 0) {
    return (
      <Gap size={16} padding={16}>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          ← Voltar
        </Button>

        <Alert variant="warning">
          <h4>Nenhum puzzle encontrado!</h4>
          <p>Analise algumas partidas primeiro para gerar puzzles dos seus erros.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Ir para Análise de Partidas
          </Button>
        </Alert>
      </Gap>
    );
  }

  return (
    <div className="container-fluid" style={{ ...backgroundStyle, minHeight: '100vh', padding: '16px' }}>
      <Gap size={16}>
        <Card>
          <Card.Body>
            <SessionStats
              puzzleIndex={session.puzzleIndex}
              totalPuzzles={session.totalPuzzles}
              correctCount={session.correctCount}
              incorrectCount={session.incorrectCount}
              streak={session.streak}
              maxStreak={session.maxStreak}
              timeElapsed={timeElapsed}
              moveNumber={session.currentPuzzle?.moveNumber}
              color={session.currentPuzzle?.color}
              attemptCount={session.attemptCount}
            />
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <ChessBoardWrapper
              position={game.fen()}
              onPieceDrop={onDrop}
              orientation={boardOrientation}
              isDraggable={!showFeedback}
            />

            <PuzzleFeedback
              showFeedback={showFeedback}
              attemptCount={session.attemptCount}
              showSolution={showSolution}
              solutionSAN={getSolutionSAN()}
              evaluationLoss={session.currentPuzzle?.evaluation}
            />

            <PuzzleControls
              onSkip={skipPuzzle}
              onNext={showSolution ? nextPuzzle : undefined}
              onReset={resetSession}
              onExit={() => window.location.reload()}
              showNext={showSolution}
              disableSkip={showFeedback === 'correct'}
            />
          </Card.Body>
        </Card>

        <GlobalStats stats={stats} />
      </Gap>
    </div>
  );
};

export default PuzzleTrainer;