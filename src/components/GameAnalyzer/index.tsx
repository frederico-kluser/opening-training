import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Button, Form, ProgressBar, Alert, Card, Badge, Modal, Table } from 'react-bootstrap';
import { getStockfish } from '../../services/StockfishService';
import puzzleService from '../../services/PuzzleService';
import { parseMultiplePGN, extractGamesInfo, GameInfo, ParsedGame, validatePGN, detectMostFrequentPlayer } from '../../utils/pgnParser';
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

interface GameSelection {
  gameIndex: number;
  color: 'white' | 'black';
  playerName: string;
}

const GameAnalyzer: React.FC = () => {
  const [pgn, setPgn] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentGame: 0, totalGames: 0 });
  const [analysis, setAnalysis] = useState<MoveAnalysis[]>([]);
  const [blunders, setBlunders] = useState<BlunderPuzzle[]>([]);
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPuzzlesCount, setSavedPuzzlesCount] = useState(0);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);

  // Estados para múltiplas partidas
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const [gamesInfo, setGamesInfo] = useState<GameInfo[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameSelection[]>([]);
  const [showMultiGameModal, setShowMultiGameModal] = useState(false);
  const [currentAnalyzingGame, setCurrentAnalyzingGame] = useState<string>('');

  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisFileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  // Estado para jogador detectado
  const [detectedPlayer, setDetectedPlayer] = useState<{
    name: string | null;
    positions: Map<number, 'white' | 'black'>;
    frequency: number;
  }>({ name: null, positions: new Map(), frequency: 0 });

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

  // Effect para detectar múltiplas partidas quando PGN muda
  useEffect(() => {
    if (pgn.trim()) {
      const games = parseMultiplePGN(pgn);
      setParsedGames(games);

      // Sempre extrair info das partidas (mesmo que seja uma só)
      const info = extractGamesInfo(games);
      setGamesInfo(info);

      // Detectar jogador mais frequente
      const detected = detectMostFrequentPlayer(games);
      setDetectedPlayer(detected);
    }
  }, [pgn]);

  // Lidar com carregamento de arquivo
  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Validar PGN
      const validation = validatePGN(content);
      if (!validation.valid) {
        setError(validation.error || 'Arquivo PGN inválido');
        return;
      }

      setPgn(content);

      // Feedback visual
      setTimeout(() => {
        const games = parseMultiplePGN(content);
        const message = games.length === 1
          ? 'Arquivo carregado: 1 partida detectada'
          : `Arquivo carregado: ${games.length} partidas detectadas`;

        // Usar alert temporariamente como feedback
        alert(message);
      }, 100);
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo');
    };

    reader.readAsText(file);
  };

  // Lidar com seleção de partidas múltiplas
  const handleGameSelection = (gameIndex: number, color: 'white' | 'black', checked: boolean) => {
    setSelectedGames(prev => {
      if (checked) {
        const game = parsedGames[gameIndex];
        const playerName = color === 'white'
          ? game.headers['White'] || 'Unknown'
          : game.headers['Black'] || 'Unknown';

        return [...prev, { gameIndex, color, playerName }];
      } else {
        return prev.filter(g => !(g.gameIndex === gameIndex && g.color === color));
      }
    });
  };

  // Iniciar análise de múltiplas partidas
  const startMultiGameAnalysis = useCallback(async () => {
    if (selectedGames.length === 0) {
      setError('Por favor, selecione ao menos uma partida para analisar');
      return;
    }

    setShowMultiGameModal(false);
    setIsAnalyzing(true);
    setError('');
    setAnalysis([]);
    setBlunders([]);

    const allBlunders: BlunderPuzzle[] = [];

    try {
      setProgress({
        current: 0,
        total: 0,
        currentGame: 0,
        totalGames: selectedGames.length
      });

      for (let g = 0; g < selectedGames.length; g++) {
        const selection = selectedGames[g];
        const gamePGN = parsedGames[selection.gameIndex].fullPGN;

        setCurrentAnalyzingGame(
          `Partida ${g + 1}/${selectedGames.length}: ${selection.playerName} (${selection.color === 'white' ? 'Brancas' : 'Pretas'})`
        );

        setProgress(prev => ({
          ...prev,
          currentGame: g + 1,
          totalGames: selectedGames.length
        }));

        // Analisar cada partida individualmente
        const gameBlunders = await analyzeGamePGN(gamePGN, selection.color);
        allBlunders.push(...gameBlunders);
      }

      setBlunders(allBlunders);

      // Salvar puzzles usando PuzzleService
      if (allBlunders.length > 0) {
        const puzzlesToSave = allBlunders.map(blunder => ({
          fenBefore: blunder.fenBefore,
          blunderMove: blunder.blunderMove,
          solution: blunder.solution,
          evaluation: blunder.evaluation,
          moveNumber: blunder.moveNumber,
          color: blunder.color as 'white' | 'black'
        }));

        puzzleService.addMultiplePuzzles(puzzlesToSave);
        setSavedPuzzlesCount(allBlunders.length);
        setShowSuccessModal(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao analisar partidas');
    } finally {
      setIsAnalyzing(false);
      setProgress({ current: 0, total: 0, currentGame: 0, totalGames: 0 });
      setCurrentAnalyzingGame('');
    }
  }, [selectedGames, parsedGames]);

  // Função auxiliar para analisar uma única partida PGN
  const analyzeGamePGN = async (gamePGN: string, playerColor: 'white' | 'black'): Promise<BlunderPuzzle[]> => {
    const foundBlunders: BlunderPuzzle[] = [];

    try {
      const game = new Chess();
      game.loadPgn(gamePGN);

      const moves = game.history({ verbose: true });
      const positions: string[] = [];

      game.reset();
      positions.push(game.fen());

      moves.forEach(move => {
        game.move(move);
        positions.push(game.fen());
      });

      setProgress(prev => ({
        ...prev,
        current: 0,
        total: moves.length
      }));

      const stockfish = getStockfish();

      for (let i = 0; i < moves.length; i++) {
        setProgress(prev => ({
          ...prev,
          current: i + 1,
          total: moves.length
        }));

        // Pular primeiros 10 lances (teoria de abertura)
        if (i < 10) continue;

        const evalBefore = await stockfish.analyze(positions[i], 18);
        const evalAfter = await stockfish.analyze(positions[i + 1], 18);

        const isWhiteTurn = i % 2 === 0;
        const cpLoss = Math.abs(
          (isWhiteTurn ? evalBefore.evaluation : -evalBefore.evaluation) -
          (isWhiteTurn ? evalAfter.evaluation : -evalAfter.evaluation)
        );

        const classification = classifyMove(cpLoss);
        const moveColor = isWhiteTurn ? 'white' : 'black';

        if (classification === 'blunder' && cpLoss > 300 && moveColor === playerColor) {
          foundBlunders.push({
            id: `blunder-${Date.now()}-${i}`,
            fenBefore: positions[i],
            blunderMove: moves[i].san,
            solution: evalBefore.bestMove,
            evaluation: cpLoss,
            moveNumber: Math.floor(i / 2) + 1,
            color: isWhiteTurn ? 'white' : 'black'
          });
        }
      }
    } catch (err) {
      console.error('Erro ao analisar partida:', err);
    }

    return foundBlunders;
  };

  // Iniciar análise - sempre mostrar modal de seleção
  const startAnalysis = useCallback(() => {
    if (!pgn.trim()) {
      setError('Por favor, insira uma partida em formato PGN ou carregue um arquivo');
      return;
    }

    // Validar PGN antes de prosseguir
    const validation = validatePGN(pgn);
    if (!validation.valid) {
      setError(validation.error || 'PGN inválido');
      return;
    }

    // Pré-selecionar as partidas do jogador detectado
    const preSelected: GameSelection[] = [];
    if (detectedPlayer.name && detectedPlayer.positions.size > 0) {
      detectedPlayer.positions.forEach((color, gameIndex) => {
        preSelected.push({
          gameIndex,
          color,
          playerName: detectedPlayer.name!
        });
      });
    }

    // Sempre mostrar modal de seleção (mesmo para uma partida)
    setShowMultiGameModal(true);
    setSelectedGames(preSelected); // Usar pré-seleção se houver
    setError(''); // Limpar erros anteriores
  }, [pgn, detectedPlayer]);

  // Analisar partida completa
  const analyzeGame = useCallback(async () => {
    if (!playerColor) return;

    setShowColorModal(false);
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

        // Se for blunder do jogador selecionado, criar puzzle
        const moveColor = isWhiteTurn ? 'white' : 'black';
        if (classification === 'blunder' && cpLoss > 300 && moveColor === playerColor) {
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
  }, [pgn, playerColor]);

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

  // Exportar análise para JSON
  const exportAnalysis = () => {
    const analysisData = {
      date: new Date().toISOString(),
      pgn: pgn,
      analysis: analysis,
      blunders: blunders,
      stats: stats,
      selectedGames: selectedGames,
      parsedGames: parsedGames
    };

    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `chess-analysis-${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importar análise de JSON
  const handleAnalysisImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const analysisData = JSON.parse(content);

        // Restaurar dados da análise
        if (analysisData.pgn) setPgn(analysisData.pgn);
        if (analysisData.analysis) setAnalysis(analysisData.analysis);
        if (analysisData.blunders) setBlunders(analysisData.blunders);
        if (analysisData.selectedGames) setSelectedGames(analysisData.selectedGames);
        if (analysisData.parsedGames) setParsedGames(analysisData.parsedGames);

        // Extrair informações dos jogos
        if (analysisData.parsedGames) {
          const info = extractGamesInfo(analysisData.parsedGames);
          setGamesInfo(info);
        }

        setError('');
        alert('Análise importada com sucesso!');
      } catch (err) {
        setError('Erro ao importar análise. Verifique se o arquivo está no formato correto.');
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo de análise');
    };

    reader.readAsText(file);

    // Limpar o input para permitir reimportar o mesmo arquivo
    if (analysisFileInputRef.current) {
      analysisFileInputRef.current.value = '';
    }
  };

  // Botão voltar
  const handleBack = () => {
    window.location.reload();
  };

  // Obter estatísticas de puzzles
  const puzzleStats = puzzleService.getStats();

  return (
    <Gap size={16}>
      {/* Modal de seleção de cor */}
      <Modal show={showColorModal} onHide={() => setShowColorModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Selecione sua cor nesta partida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around p-3">
            <Button
              variant="light"
              size="lg"
              onClick={() => {
                setPlayerColor('white');
                analyzeGame();
              }}
              className="d-flex flex-column align-items-center p-4 border"
            >
              <div style={{ fontSize: '48px' }}>♔</div>
              <span className="mt-2">Brancas</span>
            </Button>
            <Button
              variant="dark"
              size="lg"
              onClick={() => {
                setPlayerColor('black');
                analyzeGame();
              }}
              className="d-flex flex-column align-items-center p-4"
            >
              <div style={{ fontSize: '48px' }}>♚</div>
              <span className="mt-2">Pretas</span>
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal de seleção de partidas */}
      <Modal
        show={showMultiGameModal}
        onHide={() => setShowMultiGameModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {parsedGames.length === 1
              ? 'Partida Detectada - Selecione sua cor'
              : `${parsedGames.length} partidas detectadas`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Alert variant="info">
            <strong>
              {parsedGames.length === 1
                ? 'Selecione qual cor você jogou nesta partida:'
                : 'Selecione as partidas que deseja analisar:'}
            </strong>
            {parsedGames.length > 1 && (
              <>
                <br />
                Marque o checkbox ao lado de cada partida indicando qual cor você jogou.
              </>
            )}
          </Alert>

          {/* Mostrar jogador detectado */}
          {detectedPlayer.name && detectedPlayer.frequency > 0 && (
            <Alert variant="success">
              <strong>🎯 Jogador detectado automaticamente:</strong>{' '}
              <Badge bg="primary" className="ms-1">
                {detectedPlayer.name}
              </Badge>
              <br />
              <small>
                Aparece em {detectedPlayer.frequency} de {parsedGames.length} partida(s) -{' '}
                {Math.round((detectedPlayer.frequency / parsedGames.length) * 100)}%
              </small>
              <br />
              <small className="text-muted">
                As cores foram pré-selecionadas automaticamente baseado neste jogador.
              </small>
            </Alert>
          )}

          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Evento</th>
                <th>Data</th>
                <th>Brancas</th>
                <th>Pretas</th>
                <th>Resultado</th>
                <th className="text-center">Sua Cor</th>
              </tr>
            </thead>
            <tbody>
              {gamesInfo.map((game, idx) => {
                const isWhiteSelected = selectedGames.some(
                  g => g.gameIndex === idx && g.color === 'white'
                );
                const isBlackSelected = selectedGames.some(
                  g => g.gameIndex === idx && g.color === 'black'
                );

                const isDetectedPlayerWhite = game.white === detectedPlayer.name;
                const isDetectedPlayerBlack = game.black === detectedPlayer.name;

                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td><small>{game.event}</small></td>
                    <td><small>{game.date}</small></td>
                    <td>
                      <strong className={isDetectedPlayerWhite ? 'text-primary' : ''}>
                        {game.white}
                      </strong>
                      {isDetectedPlayerWhite && ' 🎯'}
                      {game.result === '1-0' && ' ✓'}
                    </td>
                    <td>
                      <strong className={isDetectedPlayerBlack ? 'text-primary' : ''}>
                        {game.black}
                      </strong>
                      {isDetectedPlayerBlack && ' 🎯'}
                      {game.result === '0-1' && ' ✓'}
                    </td>
                    <td className="text-center">
                      <Badge bg={
                        game.result === '1-0' ? 'light' :
                        game.result === '0-1' ? 'dark' :
                        'secondary'
                      } text={
                        game.result === '1-0' ? 'dark' :
                        game.result === '0-1' ? 'light' :
                        'light'
                      }>
                        {game.result}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Form.Check
                          type="checkbox"
                          label={<span style={{ fontSize: '20px' }}>♔</span>}
                          checked={isWhiteSelected}
                          onChange={(e) => handleGameSelection(idx, 'white', e.target.checked)}
                          disabled={isBlackSelected}
                        />
                        <Form.Check
                          type="checkbox"
                          label={<span style={{ fontSize: '20px' }}>♚</span>}
                          checked={isBlackSelected}
                          onChange={(e) => handleGameSelection(idx, 'black', e.target.checked)}
                          disabled={isWhiteSelected}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {selectedGames.length > 0 && (
            <Alert variant="success">
              {selectedGames.length} {selectedGames.length === 1 ? 'partida selecionada' : 'partidas selecionadas'}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMultiGameModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={startMultiGameAnalysis}
            disabled={selectedGames.length === 0}
          >
            Analisar {selectedGames.length > 0 && `(${selectedGames.length})`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de sucesso */}
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
              <Form.Label>
                Cole sua partida em formato PGN ou carregue um arquivo:
                {fileName && (
                  <Badge bg="success" className="ms-2">
                    📁 {fileName}
                  </Badge>
                )}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={pgn}
                onChange={(e) => {
                  setPgn(e.target.value);
                  setFileName(''); // Limpar nome do arquivo se digitar manualmente
                }}
                placeholder="[Event ...]&#10;&#10;Ou use o botão 'Carregar Arquivo PGN' abaixo"
                disabled={isAnalyzing}
              />
            </Form.Group>

            {/* Inputs de arquivo ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pgn"
              style={{ display: 'none' }}
              onChange={handleFileLoad}
            />
            <input
              ref={analysisFileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleAnalysisImport}
            />

            <Gap size={8} horizontal>
              <Button
                variant="primary"
                onClick={startAnalysis}
                disabled={isAnalyzing || !pgn.trim()}
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Partida(s)'}
              </Button>

              <Button
                variant="info"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                📂 Carregar Arquivo PGN
              </Button>

              <Button
                variant="warning"
                onClick={() => analysisFileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                📥 Importar Análise
              </Button>
            </Gap>
          </Form>

          {/* Mostrar informação sobre partidas carregadas */}
          {!isAnalyzing && parsedGames.length > 0 && (
            <Alert variant="info" className="mt-3">
              <strong>
                {parsedGames.length === 1
                  ? '✅ 1 partida pronta para análise'
                  : `✅ ${parsedGames.length} partidas prontas para análise`}
              </strong>
              <br />
              <small>Clique em "Analisar Partida(s)" para continuar</small>
            </Alert>
          )}

          {isAnalyzing && progress.total > 0 && (
            <div className="mt-3">
              {progress.totalGames > 1 && (
                <>
                  <div className="mb-2">
                    <small className="text-muted">{currentAnalyzingGame}</small>
                  </div>
                  <ProgressBar className="mb-2">
                    <ProgressBar
                      variant="success"
                      now={(progress.currentGame / progress.totalGames) * 100}
                      label={`Partida ${progress.currentGame}/${progress.totalGames}`}
                    />
                  </ProgressBar>
                </>
              )}
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
            <Card.Title className="d-flex justify-content-between align-items-center">
              Estatísticas
              <Button
                variant="success"
                size="sm"
                onClick={exportAnalysis}
              >
                💾 Exportar Análise
              </Button>
            </Card.Title>
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

            {blunders.map((blunder) => (
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