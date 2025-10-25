import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import CMChessboardWrapper, { CMChessboardHandle, ArrowConfig, MarkerConfig } from './CMChessboardWrapper';

interface ChessBoardWrapperProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: 'white' | 'black';
  isDraggable?: boolean | ((args: { piece: string; sourceSquare: string }) => boolean);
  width?: number | string;
  style?: React.CSSProperties;
  arrows?: ArrowConfig[];
  markers?: MarkerConfig[];
  lastMove?: [string, string] | null;
  showCoordinates?: boolean;
}

export interface ChessBoardWrapperHandle extends CMChessboardHandle {}

const ChessBoardWrapper = forwardRef<ChessBoardWrapperHandle, ChessBoardWrapperProps>(
  (
    {
      position,
      onPieceDrop,
      orientation = 'white',
      isDraggable = true,
      width = 'min(500px, 90vw, 70vh)',
      style = {},
      arrows = [],
      markers = [],
      lastMove,
      showCoordinates = true
    },
    ref
  ) => {
    const boardRef = useRef<CMChessboardHandle>(null);

    useImperativeHandle(ref, () => ({
      setPosition: (fen: string, animated = true) => boardRef.current?.setPosition(fen, animated),
      getPosition: () => boardRef.current?.getPosition() ?? position,
      addArrow: (from: string, to: string, type?: 'default' | 'pointy' | 'danger') =>
        boardRef.current?.addArrow(from, to, type),
      clearArrows: () => boardRef.current?.clearArrows(),
      addMarker: (square: string, type?: 'frame' | 'circle' | 'dot' | 'square') =>
        boardRef.current?.addMarker(square, type),
      clearMarkers: () => boardRef.current?.clearMarkers(),
      flip: () => boardRef.current?.flip(),
      setOrientation: (color: 'white' | 'black') => boardRef.current?.setOrientation(color)
    }));

    // Converter isDraggable para boolean simples
    const isDraggableBoolean = typeof isDraggable === 'boolean' ? isDraggable : true;

    return (
      <CMChessboardWrapper
        ref={boardRef}
        position={position}
        onMove={onPieceDrop}
        orientation={orientation}
        isDraggable={isDraggableBoolean}
        width={width}
        style={style}
        arrows={arrows}
        markers={markers}
        lastMove={lastMove}
        showCoordinates={showCoordinates}
      />
    );
  }
);

ChessBoardWrapper.displayName = 'ChessBoardWrapper';

export default ChessBoardWrapper;