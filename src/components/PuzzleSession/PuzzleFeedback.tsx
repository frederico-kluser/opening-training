import React from 'react';
import { Alert } from 'react-bootstrap';

interface PuzzleFeedbackProps {
  showFeedback: 'correct' | 'incorrect' | null;
  attemptCount?: number;
  showSolution?: boolean;
  solutionSAN?: string;
  evaluationLoss?: number;
  wrongMoveSAN?: string;
  wrongMovesHistory?: string[];
}

const PuzzleFeedback: React.FC<PuzzleFeedbackProps> = ({
  showFeedback,
  attemptCount = 0,
  showSolution = false,
  solutionSAN = '',
  evaluationLoss = 0,
  wrongMoveSAN = '',
  wrongMovesHistory = []
}) => {
  if (!showFeedback && !showSolution) return null;

  return (
    <>
      {showFeedback === 'correct' && (
        <>
          <Alert variant="success" className="mt-3">
            ✅ Correto! Muito bem!
          </Alert>
          {wrongMovesHistory.length > 0 && (
            <Alert variant="info" className="mt-3">
              <strong>📊 Análise dos seus erros:</strong>
              <br/>
              {wrongMovesHistory.map((move, index) => (
                <div key={index}>
                  ❌ Tentativa {index + 1}: {move}
                </div>
              ))}
              <br/>
              ✅ <strong>Movimento correto:</strong> {solutionSAN}
            </Alert>
          )}
        </>
      )}

      {showFeedback === 'incorrect' && (
        <Alert variant="danger" className="mt-3">
          ❌ Incorreto! {attemptCount < 3
            ? `Você tem ${3 - attemptCount} tentativa(s) restante(s).`
            : 'Limite de tentativas atingido. Avançando para o próximo puzzle...'}
        </Alert>
      )}

      {showSolution && solutionSAN && (
        <Alert variant="info" className="mt-3">
          {wrongMoveSAN && (
            <>
              ❌ <strong>Seu movimento:</strong> {wrongMoveSAN}
              <br/>
            </>
          )}
          ✅ <strong>Movimento correto:</strong> {solutionSAN}
          {evaluationLoss > 0 && (
            <>
              <br/>
              <small>Diferença: {evaluationLoss} centipawns</small>
            </>
          )}
        </Alert>
      )}
    </>
  );
};

export default PuzzleFeedback;