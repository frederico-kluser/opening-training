import React, { useState } from 'react';
import { Button, Alert, Form, Spinner } from 'react-bootstrap';
import { Chess } from 'chess.js';
import useStockfish from '../../hooks/useStockfish';
import Gap from '../Gap';

const StockfishTest: React.FC = () => {
  const { isReady, isAnalyzing, analyze, setSkillLevel } = useStockfish();
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [depth, setDepth] = useState(15);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    setError('');
    setResult('');

    // Validate FEN
    const chess = new Chess();
    try {
      chess.load(fen);
    } catch (e) {
      setError('FEN inválido!');
      return;
    }

    const analysis = await analyze(fen, depth);

    if (analysis) {
      const evalDisplay = analysis.evaluation > 0
        ? `+${(analysis.evaluation / 100).toFixed(2)}`
        : (analysis.evaluation / 100).toFixed(2);

      setResult(`
        🎯 Melhor movimento: ${analysis.bestMove}
        📊 Avaliação: ${evalDisplay}
        🔍 Profundidade: ${analysis.depth}
        📝 Linha principal: ${analysis.pv.slice(0, 5).join(' ')}
      `);
    } else {
      setError('Falha na análise');
    }
  };

  const loadTestPositions = () => {
    const positions = [
      { name: 'Posição Inicial', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
      { name: 'Mate em 2', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4' },
      { name: 'Final de Torres', fen: '8/8/8/4k3/8/8/4K3/R7 w - - 0 1' },
      { name: 'Tática', fen: 'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1' }
    ];

    const random = positions[Math.floor(Math.random() * positions.length)];
    setFen(random.fen);
    setResult(`Posição carregada: ${random.name}`);
  };

  return (
    <Gap size={16} padding={16}>
      <h2>Teste do Stockfish</h2>

      {!isReady ? (
        <Alert variant="warning">
          <Spinner animation="border" size="sm" /> Carregando Stockfish...
        </Alert>
      ) : (
        <Alert variant="success">
          ✅ Stockfish carregado e pronto!
        </Alert>
      )}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>FEN da Posição</Form.Label>
          <Form.Control
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            placeholder="Cole uma posição FEN aqui"
          />
          <Form.Text className="text-muted">
            FEN é a notação para descrever uma posição de xadrez
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Profundidade de Análise: {depth}</Form.Label>
          <Form.Range
            min={5}
            max={25}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nível de Habilidade</Form.Label>
          <Form.Select onChange={(e) => setSkillLevel(Number(e.target.value))}>
            <option value="20">Máximo (2800+ ELO)</option>
            <option value="15">Forte (2400 ELO)</option>
            <option value="10">Médio (2000 ELO)</option>
            <option value="5">Iniciante (1600 ELO)</option>
            <option value="0">Muito Fraco (800 ELO)</option>
          </Form.Select>
        </Form.Group>
      </Form>

      <Gap size={8} horizontal>
        <Button
          variant="primary"
          onClick={handleAnalyze}
          disabled={!isReady || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Spinner animation="border" size="sm" /> Analisando...
            </>
          ) : (
            'Analisar Posição'
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={loadTestPositions}
          disabled={isAnalyzing}
        >
          Carregar Posição de Teste
        </Button>
      </Gap>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {result && (
        <Alert variant="info" className="mt-3">
          <pre style={{ marginBottom: 0 }}>{result}</pre>
        </Alert>
      )}
    </Gap>
  );
};

export default StockfishTest;