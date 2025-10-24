import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Button, Card, Alert, Modal } from 'react-bootstrap';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import TypeStorage from '../../types/TypeStorage';
import openingTrainerService from '../../services/OpeningTrainerService';
import openingService from '../../services/OpeningService';
import Gap from '../Gap';
import SessionStats from '../PuzzleSession/SessionStats';
import PuzzleFeedback from '../PuzzleSession/PuzzleFeedback';
import GlobalStats from '../PuzzleSession/GlobalStats';
import ChessBoardWrapper from '../ChessBoard/ChessBoardWrapper';
import EvaluationBar from '../EvaluationBar';
import useStockfish from '../../hooks/useStockfish';
import useBoardSize from '../../hooks/useBoardSize';
import useScreenOrientation from '../../hooks/useScreenOrientation';
import { getElapsedTime } from '../../utils/timeUtils';
import {
  TrainingPosition,
  generateTrainingSequence,
  shouldShowOpponentMove,
  validateMove,
  parseFenInfo,
  getBoardOrientation,
  recordPositionShown
} from '../../utils/trainerUtils';

interface OpeningSession {
  currentPosition: TrainingPosition | null;
  positionIndex: number;
  totalPositions: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  maxStreak: number;
  startTime: Date;
  attemptCount: number;
  trainingPositions: TrainingPosition[];
  showHint: boolean;
  openingId?: string; // ID da abertura no OpeningService
  openingColor: 'white' | 'black'; // Cor que o usuário joga
}

interface OpeningTrainerProps {
  variant: string;
  data: TypeStorage;
  onExit: () => void;
}

const OpeningTrainer: React.FC<OpeningTrainerProps> = ({ variant, data, onExit }) => {
  const [session, setSession] = useState<OpeningSession>({
    currentPosition: null,
    positionIndex: 0,
    totalPositions: 0,
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    maxStreak: 0,
    startTime: new Date(),
    attemptCount: 0,
    trainingPositions: [],
    showHint: false,
    openingColor: 'white'
  });

  const [game, setGame] = useState(new Chess());
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [showingContext, setShowingContext] = useState(false);

  // Modal de anotações
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [modalType, setModalType] = useState<'correct' | 'failed'>('correct');

  // Estados para Evaluation Bar
  const [currentEvaluation, setCurrentEvaluation] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Hook do Stockfish
  const { analyze, isReady } = useStockfish();

  // Hook para controle de zoom do tabuleiro
  const { boardWidth, zoomIn, zoomOut, canZoomIn, canZoomOut } = useBoardSize();

  // Hook para detectar orientação da tela
  const { isPortrait } = useScreenOrientation();

  // Inicializar sessão de treinamento
  useEffect(() => {
    // Primeiro, tenta carregar do OpeningService
    const opening = openingService.getOpeningByName(variant);

    if (opening) {
      // ✅ Abertura v2.0.0 encontrada
      console.log(`✅ Usando abertura v2.0.0: "${variant}" (cor: ${opening.color})`);

      const positions = generateTrainingSequence(opening.positions, opening.color, 20);

      setSession(prev => ({
        ...prev,
        trainingPositions: positions,
        totalPositions: positions.length,
        currentPosition: positions[0] || null,
        openingId: opening.id,
        openingColor: opening.color
      }));
    } else {
      // ⚠️ Fallback para sistema legado (TypeStorage)
      console.log(`⚠️ Abertura "${variant}" não encontrada no v2.0.0, usando sistema legado`);

      if (data[variant]) {
        const positions = generateTrainingSequence(data[variant], 'white', 20); // Assume brancas por padrão

        setSession(prev => ({
          ...prev,
          trainingPositions: positions,
          totalPositions: positions.length,
          currentPosition: positions[0] || null,
          openingColor: 'white'
        }));
      }
    }
  }, [data, variant]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(getElapsedTime(session.startTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  // Função para avaliar posição com Stockfish
  const evaluatePosition = useCallback(async (fen: string) => {
    if (!isReady) return;

    setIsEvaluating(true);
    try {
      const result = await analyze(fen, 20); // depth 20 para análise mais profunda
      if (result) {
        console.log('📊 AVALIAÇÃO (Opening):', {
          fen: fen.substring(0, 30) + '...',
          evaluation: result.evaluation,
          evaluationInPawns: (result.evaluation / 100).toFixed(2),
          interpretation: result.evaluation > 0 ? '⬜ Brancas melhor' : result.evaluation < 0 ? '⬛ Pretas melhor' : '= Igual'
        });
        setCurrentEvaluation(result.evaluation);
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  }, [analyze, isReady]);

  // Carregar posição atual (com suporte a mostrar movimento do adversário)
  useEffect(() => {
    if (!session.currentPosition) return;

    const position = session.currentPosition;

    // ✅ VALIDAÇÃO EXTRA: Verifica se é realmente a vez da cor do usuário jogar
    const testGame = new Chess(position.fen);
    const currentTurn = testGame.turn(); // 'w' ou 'b'
    const expectedTurn = session.openingColor === 'white' ? 'w' : 'b';

    if (currentTurn !== expectedTurn) {
      console.error(`❌ ERRO: Posição com cor errada detectada!`, {
        positionFen: position.fen.substring(0, 50) + '...',
        expectedColor: session.openingColor,
        actualTurn: currentTurn === 'w' ? 'white' : 'black',
        positionIndex: session.positionIndex
      });

      // Pula automaticamente para a próxima posição
      console.warn(`⏭️ Pulando posição ${session.positionIndex + 1} automaticamente...`);

      // Avança para próxima posição inline (evita dependências circulares)
      if (session.positionIndex < session.trainingPositions.length - 1) {
        const nextIndex = session.positionIndex + 1;
        setSession(prev => ({
          ...prev,
          positionIndex: nextIndex,
          currentPosition: prev.trainingPositions[nextIndex]
        }));
      } else {
        // Se acabaram as posições, retorna ao menu
        console.error('❌ Todas as posições têm cor errada! Verifique se a abertura foi importada corretamente.');
        alert('⚠️ Erro: Nenhuma posição válida encontrada para treino.\n\nVerifique se a abertura foi importada com a cor correta.');
      }
      return;
    }

    // ✅ Posição válida! Registra que foi mostrada (para balanceamento futuro)
    recordPositionShown(position.fen);

    const opponentMoveInfo = shouldShowOpponentMove(position);

    // 🔄 RESETAR a barra de avaliação para 0 ao mudar de posição (recomeça do zero)
    console.log('🔄 Resetando barra de avaliação para 0 (nova posição)');
    setCurrentEvaluation(0);

    // 🎨 Define orientação do tabuleiro (SEMPRE a cor escolhida pelo usuário)
    setBoardOrientation(session.openingColor);

    console.log(`🎨 Orientação do tabuleiro: ${session.openingColor === 'white' ? '⬜ Brancas embaixo' : '⬛ Pretas embaixo'} (cor escolhida: ${session.openingColor})`);

    if (opponentMoveInfo.shouldShow && position.fenContext) {
      // 🎭 Mostrar movimento do adversário primeiro
      setShowingContext(true);
      const contextGame = new Chess(position.fenContext);
      setGame(contextGame);

      const contextInfo = parseFenInfo(position.fenContext);

      console.log('🎭 Mostrando movimento do adversário...', {
        fenContext: position.fenContext.substring(0, 30) + '...',
        turn: contextInfo.turn
      });

      // Avaliar posição de contexto
      evaluatePosition(position.fenContext);

      // Após 1 segundo, mostra a posição onde o usuário deve jogar
      setTimeout(() => {
        const newGame = new Chess(position.fen);
        setGame(newGame);
        setShowingContext(false);

        const fenInfo = parseFenInfo(position.fen);

        console.log('✅ Sua vez de jogar!', {
          fen: position.fen.substring(0, 30) + '...',
          turn: fenInfo.turn
        });

        // Avaliar posição atual
        evaluatePosition(position.fen);
      }, 1000);
    } else {
      // 🎯 Posição sem contexto ou primeiro movimento é do usuário
      const newGame = new Chess(position.fen);
      setGame(newGame);
      setShowingContext(false);

      // Avaliar posição atual
      evaluatePosition(position.fen);
    }

    // Limpa feedback
    setShowFeedback(null);
    setBackgroundStyle({});
    setSession(prev => ({ ...prev, attemptCount: 0, showHint: false }));
  }, [session.currentPosition, evaluatePosition]);

  // Verificar se peça pode ser arrastada (apenas da cor do jogador)
  const canDragPiece = useCallback(({ piece }: { piece: string; sourceSquare: string }) => {
    // Bloquear se está mostrando feedback ou contexto
    if (showFeedback || showingContext) return false;

    // Peças brancas começam com 'w', pretas com 'b'
    const pieceColor = piece[0] === 'w' ? 'white' : 'black';

    // Só permite arrastar peças da cor do jogador
    return pieceColor === session.openingColor;
  }, [showFeedback, showingContext, session.openingColor]);

  // Lidar com movimento
  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    if (!session.currentPosition || showFeedback || showingContext) return false;

    try {
      const position = session.currentPosition;

      // Valida o movimento
      const validation = validateMove(
        game.fen(),
        position.color,
        position.validNextFens || [],
        { from: sourceSquare, to: targetSquare }
      );

      if (!validation.isValid) {
        handleIncorrectMove();
        return false;
      }

      // Movimento correto
      handleCorrectMove();
      return false; // Sempre retorna false para não mover a peça até validar
    } catch (error) {
      console.error('Erro ao processar movimento:', error);
      return false;
    }
  }, [game, session.currentPosition, showFeedback, showingContext]);

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

    // Registra no serviço global
    openingTrainerService.recordCorrectMove(newStreak);

    // Registra no OpeningService se disponível
    if (session.openingId) {
      openingService.recordCorrectMove(session.openingId);
    }

    // Mostrar modal com anotações ao invés de avançar automaticamente
    setModalType('correct');
    setTimeout(() => {
      setShowAnnotationModal(true);
    }, 500); // Pequeno delay para mostrar feedback visual primeiro
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

    // Registra no serviço global
    openingTrainerService.recordIncorrectMove();

    // Registra no OpeningService se disponível
    if (session.openingId) {
      openingService.recordIncorrectMove(session.openingId);
    }

    // Após 2 tentativas, mostra dica
    if (newAttemptCount >= 2 && !session.showHint) {
      setSession(prev => ({ ...prev, showHint: true }));
    }

    // Após 3 tentativas, mostra modal ao invés de avançar automaticamente
    if (newAttemptCount >= 3) {
      setModalType('failed');
      setTimeout(() => {
        setShowAnnotationModal(true);
      }, 500);
    } else {
      // Limpa feedback após 2 segundos
      setTimeout(() => {
        setShowFeedback(null);
        setBackgroundStyle({});
      }, 2000);
    }
  };

  // Fechar modal e ir para próxima posição
  const handleModalNext = () => {
    setShowAnnotationModal(false);
    setShowFeedback(null);
    setBackgroundStyle({});

    // Pequeno delay antes de carregar próxima posição
    setTimeout(() => {
      nextPosition();
    }, 300);
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

      if (session.openingId) {
        openingService.recordSessionCompleted(session.openingId);
      }

      const accuracy = session.correctCount / (session.correctCount + session.incorrectCount) * 100;

      alert(`🎉 Sessão completa!

Acertos: ${session.correctCount}
Erros: ${session.incorrectCount}
Streak máximo: ${session.maxStreak}
Taxa de acerto: ${Math.round(accuracy)}%`);

      onExit();
    }
  };

  // Pular posição
  const skipPosition = () => {
    nextPosition();
  };

  // Mostrar solução
  const showSolution = () => {
    if (!session.currentPosition) return;

    const validMoves = session.currentPosition.validNextFens || [];
    const comment = session.currentPosition.comment || '';

    if (validMoves.length > 0) {
      alert(`💡 Movimentos válidos: ${validMoves.length} variante(s)\n\n${comment || 'Sem dica disponível'}`);
    } else {
      alert('❌ Nenhum movimento válido encontrado para esta posição');
    }
  };

  // Resetar sessão com novas posições aleatórias
  const resetSession = () => {
    const opening = openingService.getOpeningByName(variant);

    let positions: TrainingPosition[] = [];
    let color: 'white' | 'black' = 'white';

    if (opening) {
      positions = generateTrainingSequence(opening.positions, opening.color, 20);
      color = opening.color;
    } else if (data[variant]) {
      positions = generateTrainingSequence(data[variant], 'white', 20);
      color = 'white';
    }

    setSession({
      currentPosition: positions[0] || null,
      positionIndex: 0,
      totalPositions: positions.length,
      correctCount: 0,
      incorrectCount: 0,
      streak: 0,
      maxStreak: 0,
      startTime: new Date(),
      attemptCount: 0,
      trainingPositions: positions,
      showHint: false,
      openingId: opening?.id,
      openingColor: color
    });
    setTimeElapsed(0);
  };

  // Obter estatísticas globais
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
    const fenInfo = parseFenInfo(session.currentPosition.fen);
    return fenInfo.moveNumber;
  };

  // Obter cor que deve jogar
  const getCurrentColor = () => {
    if (!game) return 'white';
    return game.turn() === 'w' ? 'white' : 'black';
  };

  if (session.trainingPositions.length === 0) {
    return (
      <Gap size={16} padding={16}>
        <Button variant="primary" onClick={onExit}>
          ← Trocar Abertura
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-0">
                  📚 Treinar Aberturas: {variant}
                </h5>
                <small className="text-muted">
                  Você joga com: {session.openingColor === 'white' ? '⬜ Brancas' : '⬛ Pretas'}
                </small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={onExit}
              >
                🔄 Trocar Abertura
              </Button>
            </div>

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
            {showingContext && (
              <Alert variant="info" className="mb-3 text-center">
                <strong>🎭 Movimento do adversário...</strong>
              </Alert>
            )}

            {/* Layout com Evaluation Bar e Tabuleiro */}
            <div style={{
              display: 'flex',
              flexDirection: isPortrait ? 'column' : 'row',
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Evaluation Bar */}
              <div style={{
                display: 'flex',
                flexDirection: isPortrait ? 'row' : 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <EvaluationBar
                  evaluation={currentEvaluation}
                  height={500}
                  showNumeric={false}
                  animated={true}
                  loading={isEvaluating}
                  orientation={isPortrait ? 'horizontal' : 'vertical'}
                />
                {isEvaluating && (
                  <small className="text-muted">Analisando...</small>
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
            />

            {session.showHint && session.currentPosition?.comment && (
              <Alert variant="info" className="mt-3">
                💡 <strong>Dica:</strong> {session.currentPosition.comment}
              </Alert>
            )}

            <div className="mt-3">
              <Gap size={8} horizontal>
                <Button
                  variant="secondary"
                  onClick={skipPosition}
                  disabled={showFeedback === 'correct' || showingContext}
                >
                  Pular Posição
                </Button>

                <Button
                  variant="info"
                  onClick={showSolution}
                  disabled={showFeedback === 'correct' || showingContext}
                >
                  Mostrar Variantes
                </Button>

                <Button variant="warning" onClick={resetSession}>
                  🔄 Nova Sessão
                </Button>

                <Button variant="primary" onClick={onExit}>
                  🔄 Trocar Abertura
                </Button>

                {/* Controles de Zoom */}
                <Button
                  variant="info"
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  title="Diminuir tabuleiro"
                >
                  <FaSearchMinus />
                </Button>

                <Button
                  variant="info"
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  title="Aumentar tabuleiro"
                >
                  <FaSearchPlus />
                </Button>
              </Gap>
            </div>
          </Card.Body>
        </Card>

        <GlobalStats stats={globalStats} />
      </Gap>

      {/* Modal de Anotações */}
      <Modal
        show={showAnnotationModal}
        onHide={() => {}} // Não permite fechar clicando fora
        centered
        backdrop="static" // Não fecha clicando no backdrop
        keyboard={false} // Não fecha com ESC
      >
        <Modal.Header>
          <Modal.Title>
            {modalType === 'correct' ? (
              <>✅ Movimento Correto!</>
            ) : (
              <>❌ Fim das Tentativas</>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {session.currentPosition?.comment ? (
            <div>
              <h6>📝 Anotações do Movimento:</h6>
              <p className="mb-0">{session.currentPosition.comment}</p>
            </div>
          ) : (
            <p className="text-muted mb-0">Sem anotações para esta posição.</p>
          )}

          {modalType === 'failed' && (
            <Alert variant="warning" className="mt-3 mb-0">
              💡 Você esgotou as 3 tentativas. Revise esta posição e tente novamente na próxima sessão!
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleModalNext} size="lg" className="w-100">
            Próximo Movimento →
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OpeningTrainer;
