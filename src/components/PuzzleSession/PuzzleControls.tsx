import React from 'react';
import { Button } from 'react-bootstrap';
import Gap from '../Gap';

interface PuzzleControlsProps {
  onSkip: () => void;
  onNext?: () => void;
  onReset: () => void;
  onExit: () => void;
  showNext?: boolean;
  disableSkip?: boolean;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onSkip,
  onNext,
  onReset,
  onExit,
  showNext = false,
  disableSkip = false
}) => {
  return (
    <Gap size={8} horizontal>
      <Button
        variant="secondary"
        onClick={onSkip}
        disabled={disableSkip}
      >
        Pular Puzzle
      </Button>

      {showNext && onNext && (
        <Button variant="primary" onClick={onNext}>
          Próximo Puzzle
        </Button>
      )}

      <Button variant="warning" onClick={onReset}>
        Reiniciar Sessão
      </Button>

      <Button variant="danger" onClick={onExit}>
        Sair
      </Button>
    </Gap>
  );
};

export default PuzzleControls;