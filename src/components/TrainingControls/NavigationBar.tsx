import React from 'react';
import { Button } from 'react-bootstrap';
import { FaRedo, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';
import Gap from '../Gap';
import Download from '../Download';

interface NavigationBarProps {
  onExit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFlipBoard: () => void;
  isBoardFlipped: boolean;
  canUndo: boolean;
  canRedo: boolean;
  downloadData?: any;
  downloadDisabled?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onExit,
  onUndo,
  onRedo,
  onFlipBoard,
  isBoardFlipped,
  canUndo,
  canRedo,
  downloadData,
  downloadDisabled = true
}) => {
  return (
    <Gap size={16} horizontal>
      <Button variant="danger" onClick={onExit}>
        <ImExit color="white" />
      </Button>

      <Button
        variant="light"
        onClick={onUndo}
        disabled={!canUndo}
      >
        <FaUndo />
      </Button>

      <Button variant="secondary" onClick={onFlipBoard}>
        {!isBoardFlipped ? <RiFlipVerticalLine /> : <RiFlipVerticalFill />}
      </Button>

      <Button
        variant="light"
        onClick={onRedo}
        disabled={!canRedo}
      >
        <FaRedo />
      </Button>

      {downloadData && (
        <Download data={downloadData} disabled={downloadDisabled} />
      )}
    </Gap>
  );
};

export default NavigationBar;