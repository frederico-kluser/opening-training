import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Button, Card, Alert } from 'react-bootstrap';
import TypeStorage from '../../types/TypeStorage';
import openingTrainerService from '../../services/OpeningTrainerService';
import Gap from '../Gap';
import SessionStats from '../PuzzleSession/SessionStats';
import PuzzleFeedback from '../PuzzleSession/PuzzleFeedback';
import GlobalStats from '../PuzzleSession/GlobalStats';
import ChessBoardWrapper from '../ChessBoard/ChessBoardWrapper';
import { getElapsedTime } from '../../utils/timeUtils';

interface OpeningSession {
  currentPosition: string;
  positionIndex: number;
  totalPositions: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  maxStreak: number;
  startTime: Date;
  attemptCount: number;
  trainingPositions: string[];
  showHint: boolean;
}

interface OpeningTrainerProps {
  variant: string;
  data: TypeStorage;
  onExit: () => void;
}

const OpeningTrainer: React.FC<OpeningTrainerProps> = ({ variant, data, onExit }) => {
  const [session, setSession] = useState<OpeningSession>({
    currentPosition: '',
    positionIndex: 0,
    totalPositions: 0,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    maxStreak: 0,
    startTime: new Date(),
    attemptCount: 0,
    trainingPositions: [],
    showHint: false
  });

  const [game, setGame] = useState(new Chess());
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [comment, setComment] = useState('');

  // Inicializar sessão de treinamento com posições aleatórias
  useEffect(() => {
    const positions = openingTrainerService.generateTrainingSequence(data, variant, 20);
    if (positions.length > 0) {
      setSession(prev => ({
        ...prev,
        trainingPositions: positions,
        totalPositions: positions.length,
        currentPosition: positions[0]
      }));
    }
  }, [data, variant]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(getElapsedTime(session.startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  // Carregar posição atual
  useEffect(() => {
    if (session.currentPosition && data[variant]) {
      const newGame = new Chess(session.currentPosition);
      setGame(newGame);

      // Define orientação baseada em quem deve jogar
      const turn = newGame.turn();
      setBoardOrientation(turn === 'w' ? 'white' : 'black');

      // Carrega comentário da posição
      const positionComment = openingTrainerService.getPositionComment(
        data,
        variant,
        session.currentPosition
      );
      setComment(positionComment);

      // Limpa feedback
      setShowFeedback(null);
      setBackgroundStyle({});
      setSession(prev => ({ ...prev, attemptCount: 0, showHint: false }));
    }
  }, [session.currentPosition, data, variant]);

  // Lidar com movimento
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!session.currentPosition || showFeedback) return false;

    try {
      const gameCopy = new Chess(session.currentPosition);
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (!move) return false;

      const newFen = gameCopy.fen();
      const isValid = openingTrainerService.isValidMove(
        data,
        variant,
        session.currentPosition,
        newFen
      );

      if (isValid) {
        handleCorrectMove();
      } else {
        handleIncorrectMove();
      }

      return false; // Sempre retorna false para não mover a peça até validar
    } catch (error) {
      return false;
    }
  }, [data, variant, session.currentPosition, showFeedback]);

  // Movimento correto
  const handleCorrectMove = () => {
    setShowFeedback('correct');
    setBackgroundStyle({
      backgroundColor: '#90EE90',
      transition: 'background-color 0.5s'
    });

    const newStreak = session.streak + 1;
    setSession(prev => ({
      ...prev,
      correctCount: prev.correctCount + 1,
      streak: newStreak,
      maxStreak: Math.max(newStreak, prev.maxStreak)
    }));

    openingTrainerService.recordCorrectMove(newStreak);

    // Próxima posição após 1.5 segundos
    setTimeout(() => {
      nextPosition();
    }, 1500);
  };

  // Movimento incorreto
  const handleIncorrectMove = () => {
    const newAttemptCount = session.attemptCount + 1;

    setShowFeedback('incorrect');
    setBackgroundStyle({
      backgroundColor: '#FFB6C1',
      transition: 'background-color 0.5s'
    });

    setSession(prev => ({
      ...prev,
      attemptCount: newAttemptCount,
      incorrectCount: prev.incorrectCount + 1,
      streak: 0
    }));

    openingTrainerService.recordIncorrectMove();

    // Após 3 tentativas, mostra dica
    if (newAttemptCount >= 2 && !session.showHint) {
      setSession(prev => ({ ...prev, showHint: true }));
    }

    // Após 3 tentativas, vai para próxima
    if (newAttemptCount >= 3) {
      setTimeout(() => {
        nextPosition();
      }, 2000);
    } else {
      // Limpa feedback após 2 segundos
      setTimeout(() => {
        setShowFeedback(null);
        setBackgroundStyle({});
      }, 2000);
    }
  };

  // Próxima posição
  const nextPosition = () => {
    if (session.positionIndex < session.trainingPositions.length - 1) {
      const nextIndex = session.positionIndex + 1;
      setSession(prev => ({
        ...prev,
        positionIndex: nextIndex,
        currentPosition: prev.trainingPositions[nextIndex]
      }));
    } else {
      // Fim da sessão
      openingTrainerService.completeSession();
      alert(`Sessão completa!
        Acertos: ${session.correctCount}
        Erros: ${session.incorrectCount}
        Streak máximo: ${session.maxStreak}
        Taxa de acerto: ${Math.round(session.correctCount / (session.correctCount + session.incorrectCount) * 100)}%`);
      onExit();
    }
  };

  // Pular posição
  const skipPosition = () => {
    nextPosition();
  };

  // Mostrar solução
  const showSolution = () => {
    const validMoves = openingTrainerService.getValidMoves(data, variant, session.currentPosition);
    if (validMoves.length > 0) {
      // Mostra visualmente as variantes válidas
      alert(`Movimentos válidos: ${validMoves.length} variante(s)\n${comment}`);
    }
  };

  // Resetar sessão com novas posições aleatórias
  const resetSession = () => {
    const positions = openingTrainerService.generateTrainingSequence(data, variant, 20);
    setSession({
      currentPosition: positions[0] || '',
      positionIndex: 0,
      totalPositions: positions.length,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      maxStreak: 0,
      startTime: new Date(),
      attemptCount: 0,
      trainingPositions: positions,
      showHint: false
    });
    setTimeElapsed(0);
  };

  // Obter estatísticas
  const stats = openingTrainerService.getStats();
  const globalStats = {
    totalPuzzles: stats.totalMoves,
    solvedPuzzles: stats.correctMoves,
    successRate: stats.averageAccuracy,
    averageAttempts: stats.totalMoves > 0 ? (stats.totalMoves / Math.max(1, stats.sessionsCompleted)) : 0
  };

  // Obter número do lance atual
  const getMoveNumber = () => {
    if (!session.currentPosition) return 1;
    const fen = session.currentPosition;
    const parts = fen.split(' ');
    return parseInt(parts[5]) || 1;
  };

  // Obter cor que deve jogar
  const getCurrentColor = () => {
    if (!game) return 'white';
    return game.turn() === 'w' ? 'white' : 'black';
  };

  if (session.trainingPositions.length === 0) {
    return (
      <Gap size={16} padding={16}>
        <Button variant="secondary" onClick={onExit}>
          ← Voltar
        </Button>

        <Alert variant="warning">
          <h4>Nenhuma posição de treinamento encontrada!</h4>
          <p>Certifique-se de que o repertório "{variant}" foi carregado corretamente.</p>
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
              puzzleIndex={session.positionIndex}
              totalPuzzles={session.totalPositions}
              correctCount={session.correctCount}
              incorrectCount={session.incorrectCount}
              streak={session.streak}
              maxStreak={session.maxStreak}
              timeElapsed={timeElapsed}
              moveNumber={getMoveNumber()}
              color={getCurrentColor()}
              attemptCount={session.attemptCount}
            />
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h5 className="text-center mb-3">
              Treinando: {variant}
            </h5>

            <ChessBoardWrapper
              position={game.fen()}
              onPieceDrop={onDrop}
              orientation={boardOrientation}
              isDraggable={!showFeedback}
            />

            <PuzzleFeedback
              showFeedback={showFeedback}
              attemptCount={session.attemptCount}
            />

            {session.showHint && comment && (
              <Alert variant="info" className="mt-3">
                💡 <strong>Dica:</strong> {comment}
              </Alert>
            )}

            <div className="mt-3">
            <Gap size={8} horizontal>
              <Button
                variant="secondary"
                onClick={skipPosition}
                disabled={showFeedback === 'correct'}
              >
                Pular Posição
              </Button>

              <Button
                variant="info"
                onClick={showSolution}
                disabled={showFeedback === 'correct'}
              >
                Mostrar Variantes
              </Button>

              <Button variant="warning" onClick={resetSession}>
                Nova Sessão
              </Button>

              <Button variant="danger" onClick={onExit}>
                Sair
              </Button>
            </Gap>
            </div>
          </Card.Body>
        </Card>

        <GlobalStats stats={globalStats} />
      </Gap>
    </div>
  );
};

export default OpeningTrainer;