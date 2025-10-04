import React from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardWrapperProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: 'white' | 'black';
  isDraggable?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
}

const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
  position,
  onPieceDrop,
  orientation = 'white',
  isDraggable = true,
  width = '100%',
  style = {}
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    ...style
  };

  const boardStyle: React.CSSProperties = {
    width,
    maxWidth: typeof width === 'string' ? '500px' : width
  };

  return (
    <div style={containerStyle}>
      <div style={boardStyle}>
        <Chessboard
          position={position}
          onPieceDrop={onPieceDrop}
          boardOrientation={orientation}
          arePiecesDraggable={isDraggable}
        />
      </div>
    </div>
  );
};

export default ChessBoardWrapper;