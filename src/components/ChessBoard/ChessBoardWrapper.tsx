import React from 'react';
import { Chessboard } from 'react-chessboard';

interface ChessBoardWrapperProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: 'white' | 'black';
  isDraggable?: boolean | ((args: { piece: string; sourceSquare: string }) => boolean);
  width?: number | string;
  style?: React.CSSProperties;
}

const ChessBoardWrapper: React.FC<ChessBoardWrapperProps> = ({
  position,
  onPieceDrop,
  orientation = 'white',
  isDraggable = true,
  style = {}
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    ...style
  };

  const boardStyle: React.CSSProperties = {
    width: 'min(500px, 90vw, 70vh)', // Usa o menor valor entre 500px, 90% da largura e 70% da altura
    aspectRatio: '1/1' // Mantém o tabuleiro quadrado
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