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
import EvaluationBar from '../EvaluationBar';
import useStockfish from '../../hooks/useStockfish';
import useBoardSize from '../../hooks/useBoardSize';
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

type GameMode = 'normal' | 'rush' | 'opening';

const PuzzleTrainer: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
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
  const [showingContext, setShowingContext] = useState(false);
  const [lastWrongMove, setLastWrongMove] = useState<string>('');
  const [wrongMovesHistory, setWrongMovesHistory] = useState<string[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);

  // Estados para Evaluation Bar
  const [currentEvaluation, setCurrentEvaluation] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [initialEvaluation, setInitialEvaluation] = useState<number>(0); // Guarda avaliação inicial do puzzle

  // Hook do Stockfish
  const { analyze, isReady } = useStockfish();

  // Hook para controle de zoom do tabuleiro
  const { boardWidth, zoomIn, zoomOut, canZoomIn, canZoomOut } = useBoardSize();

  // Carregar puzzles quando o modo mudar
  useEffect(() => {
    if (gameMode) {
      loadPuzzles();
    }
  }, [gameMode]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(getElapsedTime(session.startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  // Função para avaliar posição com Stockfish
  const evaluatePosition = useCallback(async (fen: string, saveAsInitial: boolean = false) => {
    if (!isReady) return;

    setIsEvaluating(true);
    try {
      const result = await analyze(fen, 20); // depth 20 para análise mais profunda
      if (result) {
        console.log('📊 AVALIAÇÃO:', {
          fen: fen.substring(0, 30) + '...',
          evaluation: result.evaluation,
          evaluationInPawns: (result.evaluation / 100).toFixed(2),
          saveAsInitial,
          playerColor: session.currentPuzzle?.color || 'unknown',
          interpretation: result.evaluation > 0 ? '⬜ Brancas melhor' : result.evaluation < 0 ? '⬛ Pretas melhor' : '= Igual'
        });
        setCurrentEvaluation(result.evaluation);
        if (saveAsInitial) {
          setInitialEvaluation(result.evaluation);
          console.log('💾 Avaliação inicial salva:', result.evaluation);
        }
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  }, [analyze, isReady, session.currentPuzzle?.color]);

  const loadPuzzles = () => {
    // Se não há modo selecionado, não carrega ainda
    if (!gameMode) return;

    let loadedPuzzles: Puzzle[] = [];

    if (gameMode === 'rush') {
      // Modo Rush: puzzles totalmente aleatórios
      loadedPuzzles = puzzleService.getRandomPuzzles(20, true);
      setSession(prev => ({ ...prev, isRushMode: true }));
    } else if (gameMode === 'opening') {
      // Modo Opening: apenas puzzles até o movimento 10 (erros de abertura)
      loadedPuzzles = puzzleService.getOpeningPuzzles(false);
      if (loadedPuzzles.length === 0) {
        // Se não houver puzzles não resolvidos, carrega todos de abertura embaralhados
        loadedPuzzles = puzzleService.getOpeningPuzzles(true);
      }
    } else {
      // Modo Normal: puzzles embaralhados mas sem repetição
      loadedPuzzles = puzzleService.getShuffledPuzzles(false);
      if (loadedPuzzles.length === 0) {
        // Se não houver puzzles não resolvidos, carrega todos embaralhados
        loadedPuzzles = puzzleService.getShuffledPuzzles(true);
      }
    }

    setPuzzles(loadedPuzzles);
    setSession(prev => ({
      ...prev,
      totalPuzzles: loadedPuzzles.length,
      startTime: new Date()
    }));
  };

  // Carregar puzzle
  useEffect(() => {
    if (puzzles.length > 0 && session.puzzleIndex < puzzles.length) {
      const puzzle = puzzles[session.puzzleIndex];

      // 🔄 RESETAR a barra de avaliação para 0 ao mudar de puzzle (recomeça do zero)
      console.log('🔄 Resetando barra de avaliação para 0 (novo puzzle)');
      setCurrentEvaluation(0);
      setInitialEvaluation(0);

      // Se tem contexto (movimento anterior), mostra primeiro ele
      if (puzzle.fenContext) {
        setShowingContext(true);
        const contextGame = new Chess(puzzle.fenContext);
        setGame(contextGame);

        // ✅ v2.0.0: Usar avaliação salva se disponível, senão reavaliar
        if (puzzle.evalContext !== undefined) {
          console.log('✅ Usando evalContext salvo:', puzzle.evalContext);
          setCurrentEvaluation(puzzle.evalContext);
        } else {
          console.log('⚠️ evalContext não disponível, reavaliando...');
          evaluatePosition(puzzle.fenContext, false);
        }

        // Após 1 segundo, avança para a posição do puzzle
        setTimeout(() => {
          const newGame = new Chess(puzzle.fenBefore);
          setGame(newGame);
          setShowingContext(false);

          // ✅ v2.0.0: Usar avaliação salva se disponível, senão reavaliar
          if (puzzle.evalBefore !== undefined) {
            console.log('✅ Usando evalBefore salvo:', puzzle.evalBefore);
            setCurrentEvaluation(puzzle.evalBefore);
            setInitialEvaluation(puzzle.evalBefore);
          } else {
            console.log('⚠️ evalBefore não disponível, reavaliando...');
            evaluatePosition(puzzle.fenBefore, true);
          }
        }, 1000);
      } else {
        // Se não tem contexto, carrega direto
        const newGame = new Chess(puzzle.fenBefore);
        setGame(newGame);
        setShowingContext(false);

        // ✅ v2.0.0: Usar avaliação salva se disponível, senão reavaliar
        if (puzzle.evalBefore !== undefined) {
          console.log('✅ Usando evalBefore salvo:', puzzle.evalBefore);
          setCurrentEvaluation(puzzle.evalBefore);
          setInitialEvaluation(puzzle.evalBefore);
        } else {
          console.log('⚠️ evalBefore não disponível, reavaliando...');
          evaluatePosition(puzzle.fenBefore, true);
        }
      }

      setSession(prev => ({ ...prev, currentPuzzle: puzzle, attemptCount: 0 }));
      setBoardOrientation(puzzle.color);
      setShowFeedback(null);
      setShowSolution(false);
      setBackgroundStyle({});
      setLastWrongMove('');
      setWrongMovesHistory([]);
      setShowNextButton(false);
    }
  }, [puzzles, session.puzzleIndex, evaluatePosition]);


  // Verificar se peça pode ser arrastada (apenas da cor do jogador)
  const canDragPiece = useCallback(({ piece }: { piece: string; sourceSquare: string }) => {
    // Bloquear se está mostrando feedback ou contexto
    if (showFeedback || showingContext || !session.currentPuzzle) return false;

    // Peças brancas começam com 'w', pretas com 'b'
    const pieceColor = piece[0] === 'w' ? 'white' : 'black';

    // Só permite arrastar peças da cor do jogador no puzzle
    return pieceColor === session.currentPuzzle.color;
  }, [showFeedback, showingContext, session.currentPuzzle]);

  // Lidar com movimento
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!session.currentPuzzle || showFeedback || showingContext) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // sempre promove para dama
      });

      if (!move) return false;

      // Converter movimento para notação UCI
      const uciMove = moveToUCI(sourceSquare, targetSquare, move.promotion);

      console.log('🎯 MOVIMENTO FEITO:', {
        move: move.san,
        uci: uciMove,
        playerColor: session.currentPuzzle.color,
        fenAfterMove: game.fen().substring(0, 30) + '...'
      });

      // Salvar informações do movimento
      const moveSan = move.san;
      const fenAfterMove = game.fen();

      // Salvar referência do puzzle atual
      const currentPuzzle = session.currentPuzzle;

      // Avaliar a nova posição após o movimento (de forma assíncrona)
      (async () => {
        if (!currentPuzzle) return;

        const result = await analyze(fenAfterMove, 20);

        if (!result) {
          console.error('❌ Falha ao avaliar movimento');
          return;
        }

        const newEvaluation = result.evaluation;
        const oldEvaluation = initialEvaluation;

        console.log('📊 COMPARAÇÃO DE AVALIAÇÕES:', {
          antes: oldEvaluation,
          depois: newEvaluation,
          diferença: newEvaluation - oldEvaluation,
          playerColor: currentPuzzle.color
        });

        // Determinar se o movimento melhorou a posição
        let isCorrect = false;

        if (currentPuzzle.color === 'white') {
          // Brancas: movimento correto se avaliação aumentou (ficou mais positivo)
          isCorrect = newEvaluation > oldEvaluation;
          console.log(`⬜ BRANCAS: ${oldEvaluation} → ${newEvaluation} = ${isCorrect ? '✅ MELHOROU' : '❌ PIOROU'}`);
        } else {
          // Pretas: movimento correto se avaliação diminuiu (ficou mais negativo)
          isCorrect = newEvaluation < oldEvaluation;
          console.log(`⬛ PRETAS: ${oldEvaluation} → ${newEvaluation} = ${isCorrect ? '✅ MELHOROU' : '❌ PIOROU'}`);
        }

        // Atualizar avaliação na barra
        setCurrentEvaluation(newEvaluation);

        if (isCorrect) {
          console.log('✅ MOVIMENTO CORRETO! Posição melhorou.');
          handleCorrectMove();
        } else {
          console.log('❌ MOVIMENTO INCORRETO! Posição piorou.');
          // Salvar movimento errado antes de desfazer
          setLastWrongMove(moveSan);
          setWrongMovesHistory(prev => [...prev, moveSan]);
          handleIncorrectMove();
          // Desfaz o movimento errado
          game.undo();
          setGame(new Chess(game.fen())); // Force re-render
        }
      })();

      return true;
    } catch (error) {
      console.error('Erro ao processar movimento:', error);
      return false;
    }
  }, [game, session.currentPuzzle, showFeedback, showingContext, analyze, initialEvaluation]);

  // Movimento correto
  const handleCorrectMove = () => {
    setShowFeedback('correct');
    setShowNextButton(true);
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

    // Restaurar avaliação inicial após um breve delay para mostrar a mudança
    setTimeout(() => {
      setCurrentEvaluation(initialEvaluation);
    }, 800);

    // Se já errou 3 vezes, mostra a solução após 1 segundo
    if (newAttemptCount >= 3) {
      setTimeout(() => {
        setShowSolution(true);
        setShowNextButton(true);
        setBackgroundStyle({});
      }, 1000);
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
    setGameMode(null);
    setPuzzles([]);
    setSession({
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
    setTimeElapsed(0);
    setShowFeedback(null);
    setShowSolution(false);
    setBackgroundStyle({});
  };

  // Converter solução UCI para SAN
  const getSolutionSAN = () => {
    if (!session.currentPuzzle) return '';
    return convertUCItoSAN(session.currentPuzzle.solution, session.currentPuzzle.fenBefore);
  };

  // Obter estatísticas
  const stats = puzzleService.getStats();

  // Tela de seleção de modo
  if (!gameMode) {
    const hasPuzzles = puzzleService.getPuzzles().length > 0;

    return (
      <Gap size={16} padding={16}>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          ← Voltar
        </Button>

        <Card>
          <Card.Body>
            <h3 className="text-center mb-4">Escolha o Modo de Treinamento</h3>

            {hasPuzzles ? (
              <Gap size={12}>
                <Button
                  variant="primary"
                  className="w-100 py-3"
                  onClick={() => setGameMode('normal')}
                >
                  <h5>🎯 Modo Normal</h5>
                  <small>Puzzles embaralhados sem repetição</small>
                </Button>

                <Button
                  variant="danger"
                  className="w-100 py-3"
                  onClick={() => setGameMode('rush')}
                >
                  <h5>⚡ Modo Rush</h5>
                  <small>Puzzles totalmente aleatórios com repetição</small>
                </Button>

                <Button
                  variant="success"
                  className="w-100 py-3"
                  onClick={() => setGameMode('opening')}
                >
                  <h5>♟️ Modo Opening</h5>
                  <small>Apenas erros de abertura (até movimento 10)</small>
                </Button>

                <hr />

                <div className="text-center">
                  <small className="text-muted">
                    {stats.totalPuzzles} puzzles disponíveis • {stats.solvedPuzzles} resolvidos
                  </small>
                </div>
              </Gap>
            ) : (
              <Alert variant="warning">
                <h4>Nenhum puzzle encontrado!</h4>
                <p>Analise algumas partidas primeiro para gerar puzzles dos seus erros.</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Voltar ao Menu
                </Button>
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Gap>
    );
  }

  if (puzzles.length === 0 && gameMode) {
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">
                  {gameMode === 'rush' && '⚡ Modo Rush'}
                  {gameMode === 'normal' && '🎯 Modo Normal'}
                  {gameMode === 'opening' && '♟️ Modo Opening'}
                </h5>
                {gameMode === 'rush' && (
                  <small className="text-muted">Puzzles aleatórios com repetição</small>
                )}
                {gameMode === 'opening' && (
                  <small className="text-muted">Erros de abertura (movimentos 1-10)</small>
                )}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                ← Voltar
              </Button>
            </div>

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
            {showingContext && (
              <Alert variant="info" className="mb-3 text-center">
                <strong>Mostrando posição anterior...</strong>
              </Alert>
            )}

            {/* Layout com Evaluation Bar e Tabuleiro */}
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Evaluation Bar */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <EvaluationBar
                  evaluation={currentEvaluation}
                  height={500}
                  showNumeric={true}
                  animated={true}
                  loading={isEvaluating}
                />
                {isEvaluating && (
                  <small className="text-muted mt-2">Analisando...</small>
                )}
              </div>

              {/* Tabuleiro */}
              <div style={{
                flex: '1 1 auto',
                minWidth: '320px',
                maxWidth: '600px'
              }}>
                <ChessBoardWrapper
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  orientation={boardOrientation}
                  isDraggable={canDragPiece}
                  width={boardWidth}
                />
              </div>
            </div>

            <PuzzleFeedback
              showFeedback={showFeedback}
              attemptCount={session.attemptCount}
              showSolution={showSolution}
              solutionSAN={getSolutionSAN()}
              evaluationLoss={session.currentPuzzle?.evaluation}
              wrongMoveSAN={lastWrongMove}
              wrongMovesHistory={wrongMovesHistory}
            />

            <div className="mt-3">
              <PuzzleControls
                onSkip={skipPuzzle}
                onNext={showNextButton ? nextPuzzle : undefined}
                onReset={resetSession}
                onExit={() => window.location.reload()}
                showNext={showNextButton}
                disableSkip={showFeedback === 'correct' || showNextButton}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                canZoomIn={canZoomIn}
                canZoomOut={canZoomOut}
              />
            </div>
          </Card.Body>
        </Card>

        <GlobalStats stats={stats} />
      </Gap>
    </div>
  );
};

export default PuzzleTrainer;