import React, { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Button, Form, ProgressBar, Alert, Card, Badge, Modal } from 'react-bootstrap';
import { getStockfish } from '../../services/StockfishService';
import puzzleService from '../../services/PuzzleService';
import Gap from '../Gap';

interface MoveAnalysis {
  moveNumber: number;
  move: string;
  fen: string;
  evaluation: number;
  bestMove: string;
  centipawnLoss: number;
  classification: 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  isWhiteMove: boolean;
}

interface BlunderPuzzle {
  id: string;
  fenBefore: string; // Posição antes do blunder
  blunderMove: string; // O movimento ruim
  solution: string; // O melhor movimento
  evaluation: number; // Vantagem perdida
  moveNumber: number;
  color: 'white' | 'black';
}

const GameAnalyzer: React.FC = () => {
  const [pgn, setPgn] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([]);
  const [blunders, setBlunders] = useState<BlunderPuzzle[]>([]);
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPuzzlesCount, setSavedPuzzlesCount] = useState(0);

  // Classificar movimento baseado em centipawn loss
  const classifyMove = (cpLoss: number): MoveAnalysis['classification'] => {
    if (cpLoss < 0) return 'brilliant'; // Ganhou material inesperado
    if (cpLoss < 10) return 'best';
    if (cpLoss < 50) return 'good';
    if (cpLoss < 100) return 'inaccuracy';
    if (cpLoss < 300) return 'mistake';
    return 'blunder';
  };

  // Cor do badge baseado na classificação
  const getClassificationColor = (classification: MoveAnalysis['classification']) => {
    switch (classification) {
      case 'brilliant': return 'success';
      case 'best': return 'primary';
      case 'good': return 'info';
      case 'inaccuracy': return 'warning';
      case 'mistake': return 'warning';
      case 'blunder': return 'danger';
    }
  };

  // Analisar partida completa
  const analyzeGame = useCallback(async () => {
    if (!pgn.trim()) {
      setError('Por favor, insira uma partida em formato PGN');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis([]);
    setBlunders([]);

    try {
      // Parsear PGN
      const game = new Chess();
      game.loadPgn(pgn);

      // Extrair todas as posições
      const moves = game.history({ verbose: true });
      const positions: string[] = [];

      // Reset para replay
      game.reset();
      positions.push(game.fen()); // Posição inicial

      moves.forEach(move => {
        game.move(move);
        positions.push(game.fen());
      });

      // Configurar progresso
      setProgress({ current: 0, total: positions.length - 1 });

      // Analisar cada movimento
      const stockfish = getStockfish();
      const moveAnalyses: MoveAnalysis[] = [];
      const foundBlunders: BlunderPuzzle[] = [];

      for (let i = 0; i < moves.length; i++) {
        setProgress({ current: i + 1, total: moves.length });

        // Pular primeiros 10 lances (teoria de abertura)
        if (i < 10) {
          moveAnalyses.push({
            moveNumber: Math.floor(i / 2) + 1,
            move: moves[i].san,
            fen: positions[i + 1],
            evaluation: 0,
            bestMove: '',
            centipawnLoss: 0,
            classification: 'good',
            isWhiteMove: i % 2 === 0
          });
          continue;
        }

        // Analisar posição ANTES do movimento
        const evalBefore = await stockfish.analyze(positions[i], 18);

        // Analisar posição DEPOIS do movimento
        const evalAfter = await stockfish.analyze(positions[i + 1], 18);

        // Calcular centipawn loss
        const isWhiteTurn = i % 2 === 0;
        const cpLoss = Math.abs(
          (isWhiteTurn ? evalBefore.evaluation : -evalBefore.evaluation) -
          (isWhiteTurn ? evalAfter.evaluation : -evalAfter.evaluation)
        );

        const classification = classifyMove(cpLoss);

        const moveAnalysis: MoveAnalysis = {
          moveNumber: Math.floor(i / 2) + 1,
          move: moves[i].san,
          fen: positions[i + 1],
          evaluation: evalAfter.evaluation,
          bestMove: evalBefore.bestMove,
          centipawnLoss: cpLoss,
          classification,
          isWhiteMove: isWhiteTurn
        };

        moveAnalyses.push(moveAnalysis);

        // Se for blunder, criar puzzle
        if (classification === 'blunder' && cpLoss > 300) {
          foundBlunders.push({
            id: `blunder-${i}`,
            fenBefore: positions[i],
            blunderMove: moves[i].san,
            solution: evalBefore.bestMove,
            evaluation: cpLoss,
            moveNumber: Math.floor(i / 2) + 1,
            color: isWhiteTurn ? 'white' : 'black'
          });
        }
      }

      setAnalysis(moveAnalyses);
      setBlunders(foundBlunders);

      // Salvar puzzles usando PuzzleService
      if (foundBlunders.length > 0) {
        const puzzlesToSave = foundBlunders.map(blunder => ({
          fenBefore: blunder.fenBefore,
          blunderMove: blunder.blunderMove,
          solution: blunder.solution,
          evaluation: blunder.evaluation,
          moveNumber: blunder.moveNumber,
          color: blunder.color as 'white' | 'black'
        }));

        puzzleService.addMultiplePuzzles(puzzlesToSave);
        setSavedPuzzlesCount(foundBlunders.length);
        setShowSuccessModal(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar partida');
    } finally {
      setIsAnalyzing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [pgn]);

  // Estatísticas da análise
  const getStats = () => {
    if (analysis.length === 0) return null;

    const whiteAnalysis = analysis.filter(m => m.isWhiteMove);
    const blackAnalysis = analysis.filter(m => !m.isWhiteMove);

    const calculateACPL = (moves: MoveAnalysis[]) => {
      if (moves.length === 0) return 0;
      const totalCPL = moves.reduce((sum, m) => sum + m.centipawnLoss, 0);
      return Math.round(totalCPL / moves.length);
    };

    return {
      white: {
        acpl: calculateACPL(whiteAnalysis),
        blunders: whiteAnalysis.filter(m => m.classification === 'blunder').length,
        mistakes: whiteAnalysis.filter(m => m.classification === 'mistake').length,
        inaccuracies: whiteAnalysis.filter(m => m.classification === 'inaccuracy').length
      },
      black: {
        acpl: calculateACPL(blackAnalysis),
        blunders: blackAnalysis.filter(m => m.classification === 'blunder').length,
        mistakes: blackAnalysis.filter(m => m.classification === 'mistake').length,
        inaccuracies: blackAnalysis.filter(m => m.classification === 'inaccuracy').length
      }
    };
  };

  const stats = getStats();

  // PGN de exemplo
  const loadExamplePGN = () => {
    setPgn(`[Event "Example Game"]
[Site "Chess.com"]
[Date "2024.01.01"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 O-O
8. c3 d6 9. h3 Nb8 10. d4 Nbd7 11. Nbd2 Bb7 12. Bc2 Re8 13. Nf1 Bf8
14. Ng3 g6 15. a4 c5 16. d5 c4 17. Bg5 h6 18. Be3 Nc5 19. Qd2 h5
20. Bg5 Bg7 21. Nh2 Qb6 22. Rf1 bxa4 23. f4 exf4 24. Bxf4 Nfd7
25. Ngf1 f6 26. g4 h4 27. Qf2 Qxf2+ 28. Rxf2 a3 29. bxa3 Bf8
30. Nd2 Bxa3 31. Nxc4 Bf8 32. Nf3 a5 33. Rfa2 Ra6 34. Nfd2 Rea8
35. Nb1 Bc8 36. Nbd2 Bd7 37. Kf2 Bb5 38. Nb2 Nb6 39. c4 Bd7
40. Ke3 a4 41. Kd4 a3 42. Nc3 1-0`);
  };

  // Botão voltar
  const handleBack = () => {
    window.location.reload();
  };

  // Obter estatísticas de puzzles
  const puzzleStats = puzzleService.getStats();

  return (
    <Gap size={16}>
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Puzzles Salvos com Sucesso!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success">
            🎉 {savedPuzzlesCount} puzzles foram salvos!
          </Alert>
          <p>Total de puzzles salvos: <strong>{puzzleStats.totalPuzzles}</strong></p>
          <p>Puzzles não resolvidos: <strong>{puzzleStats.totalPuzzles - puzzleStats.solvedPuzzles}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            Continuar Analisando
          </Button>
        </Modal.Footer>
      </Modal>

      <Button variant="secondary" onClick={handleBack}>
        ← Voltar
      </Button>

      <Card>
        <Card.Body>
          <Card.Title>Analisador de Partidas</Card.Title>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cole sua partida em formato PGN:</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
                placeholder="[Event ...]"
                disabled={isAnalyzing}
              />
            </Form.Group>

            <Gap size={8} horizontal>
              <Button
                variant="primary"
                onClick={analyzeGame}
                disabled={isAnalyzing || !pgn.trim()}
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Partida'}
              </Button>

              <Button
                variant="secondary"
                onClick={loadExamplePGN}
                disabled={isAnalyzing}
              >
                Carregar Exemplo
              </Button>
            </Gap>
          </Form>

          {isAnalyzing && progress.total > 0 && (
            <div className="mt-3">
              <ProgressBar
                now={(progress.current / progress.total) * 100}
                label={`${progress.current}/${progress.total} movimentos`}
                animated
                striped
              />
            </div>
          )}

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {stats && (
        <Card>
          <Card.Body>
            <Card.Title>Estatísticas</Card.Title>
            <div className="row">
              <div className="col-md-6">
                <h5>Brancas</h5>
                <p>ACPL (Average Centipawn Loss): <strong>{stats.white.acpl}</strong></p>
                <p>Blunders: <Badge bg="danger">{stats.white.blunders}</Badge></p>
                <p>Mistakes: <Badge bg="warning">{stats.white.mistakes}</Badge></p>
                <p>Inaccuracies: <Badge bg="info">{stats.white.inaccuracies}</Badge></p>
              </div>
              <div className="col-md-6">
                <h5>Pretas</h5>
                <p>ACPL: <strong>{stats.black.acpl}</strong></p>
                <p>Blunders: <Badge bg="danger">{stats.black.blunders}</Badge></p>
                <p>Mistakes: <Badge bg="warning">{stats.black.mistakes}</Badge></p>
                <p>Inaccuracies: <Badge bg="info">{stats.black.inaccuracies}</Badge></p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {blunders.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>
              Blunders Detectados ({blunders.length})
              {puzzleStats.totalPuzzles > 0 && (
                <Badge bg="info" className="ms-2">
                  Total de Puzzles Salvos: {puzzleStats.totalPuzzles}
                </Badge>
              )}
            </Card.Title>

            {blunders.map((blunder, idx) => (
              <Alert key={blunder.id} variant="danger">
                <strong>Lance {blunder.moveNumber} ({blunder.color}):</strong> {blunder.blunderMove}
                <br />
                <small>Melhor seria: {blunder.solution} (perdeu {blunder.evaluation} centipawns)</small>
              </Alert>
            ))}
          </Card.Body>
        </Card>
      )}

      {analysis.length > 0 && (
        <Card>
          <Card.Body>
            <Card.Title>Análise Detalhada</Card.Title>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Movimento</th>
                    <th>Classificação</th>
                    <th>CPL</th>
                    <th>Avaliação</th>
                    <th>Melhor Lance</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.map((move, idx) => (
                    <tr key={idx}>
                      <td>{move.moveNumber}{move.isWhiteMove ? '.' : '...'}</td>
                      <td><strong>{move.move}</strong></td>
                      <td>
                        <Badge bg={getClassificationColor(move.classification)}>
                          {move.classification}
                        </Badge>
                      </td>
                      <td>{move.centipawnLoss}</td>
                      <td>{(move.evaluation / 100).toFixed(2)}</td>
                      <td><code>{move.bestMove || '-'}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Gap>
  );
};

export default GameAnalyzer;