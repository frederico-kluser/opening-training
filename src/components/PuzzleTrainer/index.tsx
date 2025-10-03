import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Button, Card, Alert, Badge, ProgressBar, Row, Col } from 'react-bootstrap';
import { Chessboard } from 'react-chessboard';
import puzzleService from '../../services/PuzzleService';
import { Puzzle } from '../../types/Puzzle';
import Gap from '../Gap';

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
      setTimeElapsed(Date.now() - session.startTime.getTime());
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

  // Formatar tempo
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
      const uciMove = sourceSquare + targetSquare + (move.promotion ? move.promotion : '');

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

    const tempGame = new Chess(session.currentPuzzle.fenBefore);
    const from = session.currentPuzzle.solution.substring(0, 2);
    const to = session.currentPuzzle.solution.substring(2, 4);
    const promotion = session.currentPuzzle.solution.substring(4, 5);

    try {
      const move = tempGame.move({
        from,
        to,
        promotion: promotion || undefined
      });
      return move ? move.san : session.currentPuzzle.solution;
    } catch {
      return session.currentPuzzle.solution;
    }
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
            <Row>
              <Col xs={12} md={8}>
                <h4>
                  Puzzle {session.puzzleIndex + 1} de {session.totalPuzzles}
                  {session.currentPuzzle && (
                    <Badge bg="secondary" className="ms-2">
                      Lance {session.currentPuzzle.moveNumber}
                    </Badge>
                  )}
                </h4>
              </Col>
              <Col xs={12} md={4} className="text-end">
                <Badge bg="success" className="me-2">✓ {session.correctCount}</Badge>
                <Badge bg="danger" className="me-2">✗ {session.incorrectCount}</Badge>
                <Badge bg="info">🔥 {session.streak}</Badge>
              </Col>
            </Row>

            <ProgressBar
              now={(session.puzzleIndex + 1) / session.totalPuzzles * 100}
              className="mb-3"
            />

            <Row>
              <Col xs={12} md={6}>
                <p>
                  <strong>Tempo:</strong> {formatTime(timeElapsed)}<br/>
                  <strong>Streak Máximo:</strong> {session.maxStreak}<br/>
                  <strong>Taxa de Acerto:</strong> {
                    session.correctCount + session.incorrectCount > 0
                      ? Math.round(session.correctCount / (session.correctCount + session.incorrectCount) * 100)
                      : 0
                  }%
                </p>
              </Col>
              <Col xs={12} md={6} className="text-md-end text-start mt-3 mt-md-0">
                {session.currentPuzzle && (
                  <div>
                    <Badge bg={session.currentPuzzle.color === 'white' ? 'light' : 'dark'}>
                      {session.currentPuzzle.color === 'white' ? 'Brancas' : 'Pretas'}
                    </Badge>
                    {session.attemptCount > 0 && (
                      <p className="mt-2">
                        <small>Tentativas: <strong>{session.attemptCount}/3</strong></small>
                      </p>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="d-flex justify-content-center">
              <div style={{ width: '100%', maxWidth: '500px' }}>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  boardOrientation={boardOrientation}
                  arePiecesDraggable={!showFeedback}
                />
              </div>
            </div>

            {showFeedback === 'correct' && (
              <Alert variant="success" className="mt-3">
                ✅ Correto! Muito bem!
              </Alert>
            )}

            {showFeedback === 'incorrect' && (
              <Alert variant="danger" className="mt-3">
                ❌ Incorreto! {session.attemptCount < 3 ? `Você tem ${3 - session.attemptCount} tentativa(s) restante(s).` : 'Limite de tentativas atingido. Avançando para o próximo puzzle...'}
              </Alert>
            )}

            {showSolution && session.currentPuzzle && (
              <Alert variant="info" className="mt-3">
                💡 <strong>Solução:</strong> {getSolutionSAN()}
                <br/>
                <small>Perdeu {session.currentPuzzle.evaluation} centipawns</small>
              </Alert>
            )}

            <Gap size={8} horizontal>
              <Button
                variant="secondary"
                onClick={skipPuzzle}
                disabled={showFeedback === 'correct'}
              >
                Pular Puzzle
              </Button>

              {showSolution && (
                <Button variant="primary" onClick={nextPuzzle}>
                  Próximo Puzzle
                </Button>
              )}

              <Button variant="warning" onClick={resetSession}>
                Reiniciar Sessão
              </Button>

              <Button variant="danger" onClick={() => window.location.reload()}>
                Sair
              </Button>
            </Gap>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h5>Estatísticas Globais</h5>
            <Row>
              <Col xs={6} md={3}>
                <p><strong>Total de Puzzles:</strong> {stats.totalPuzzles}</p>
              </Col>
              <Col xs={6} md={3}>
                <p><strong>Resolvidos:</strong> {stats.solvedPuzzles}</p>
              </Col>
              <Col xs={6} md={3}>
                <p><strong>Taxa de Sucesso:</strong> {stats.successRate.toFixed(1)}%</p>
              </Col>
              <Col xs={6} md={3}>
                <p><strong>Média de Tentativas:</strong> {stats.averageAttempts.toFixed(1)}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Gap>
    </div>
  );
};

export default PuzzleTrainer;