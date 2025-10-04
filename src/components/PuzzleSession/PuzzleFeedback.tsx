import React from 'react';
import { Alert } from 'react-bootstrap';

interface PuzzleFeedbackProps {
  showFeedback: 'correct' | 'incorrect' | null;
  attemptCount?: number;
  showSolution?: boolean;
  solutionSAN?: string;
  evaluationLoss?: number;
}

const PuzzleFeedback: React.FC<PuzzleFeedbackProps> = ({
  showFeedback,
  attemptCount = 0,
  showSolution = false,
  solutionSAN = '',
  evaluationLoss = 0
}) => {
  if (!showFeedback && !showSolution) return null;

  return (
    <>
      {showFeedback === 'correct' && (
        <Alert variant="success" className="mt-3">
          ✅ Correto! Muito bem!
        </Alert>
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
          💡 <strong>Solução:</strong> {solutionSAN}
          {evaluationLoss > 0 && (
            <>
              <br/>
              <small>Perdeu {evaluationLoss} centipawns</small>
            </>
          )}
        </Alert>
      )}
    </>
  );
};

export default PuzzleFeedback;