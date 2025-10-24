import React from 'react';
import { Button } from 'react-bootstrap';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import Gap from '../Gap';

interface PuzzleControlsProps {
  onSkip: () => void;
  onNext?: () => void;
  onReset: () => void;
  onExit: () => void;
  showNext?: boolean;
  disableSkip?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onSkip,
  onNext,
  onReset,
  onExit,
  showNext = false,
  disableSkip = false,
  onZoomIn,
  onZoomOut,
  canZoomIn = true,
  canZoomOut = true
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

      {/* Controles de Zoom */}
      {onZoomOut && (
        <Button
          variant="info"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          title="Diminuir tabuleiro"
        >
          <FaSearchMinus />
        </Button>
      )}

      {onZoomIn && (
        <Button
          variant="info"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          title="Aumentar tabuleiro"
        >
          <FaSearchPlus />
        </Button>
      )}
    </Gap>
  );
};

export default PuzzleControls;