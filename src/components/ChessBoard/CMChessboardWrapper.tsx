import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Chessboard, COLOR, INPUT_EVENT_TYPE, FEN } from 'cm-chessboard';
import { Arrows, ARROW_TYPE } from 'cm-chessboard/src/extensions/arrows/Arrows.js';
import { Markers, MARKER_TYPE } from 'cm-chessboard/src/extensions/markers/Markers.js';
import { CustomRightClickAnnotator } from './CustomRightClickAnnotator.js';

// Import CSS do cm-chessboard
import './CMChessboard.css';

export interface ArrowConfig {
  from: string;
  to: string;
  type?: 'default' | 'pointy' | 'danger';
}

export interface MarkerConfig {
  square: string;
  type?: 'frame' | 'circle' | 'dot' | 'square';
}

export interface CMChessboardProps {
  position?: string;
  orientation?: 'white' | 'black';
  onMove?: (from: string, to: string) => boolean;
  arrows?: ArrowConfig[];
  markers?: MarkerConfig[];
  lastMove?: [string, string] | null;
  isDraggable?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
  customSquareStyles?: Record<string, React.CSSProperties>;
  showCoordinates?: boolean;
}

export interface CMChessboardHandle {
  setPosition: (fen: string, animated?: boolean) => void;
  getPosition: () => string;
  addArrow: (from: string, to: string, type?: 'default' | 'pointy' | 'danger') => void;
  clearArrows: () => void;
  addMarker: (square: string, type?: 'frame' | 'circle' | 'dot' | 'square') => void;
  clearMarkers: () => void;
  flip: () => void;
  setOrientation: (color: 'white' | 'black') => void;
}

const CMChessboardWrapper = forwardRef<CMChessboardHandle, CMChessboardProps>(
  (
    {
      position = FEN.start,
      orientation = 'white',
      onMove,
      arrows = [],
      markers = [],
      lastMove,
      isDraggable = true,
      width = 'min(500px, 90vw, 70vh)',
      style = {},
      showCoordinates = true
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<Chessboard | null>(null);

    // Inicializar tabuleiro
    useEffect(() => {
      if (!containerRef.current || boardRef.current) return;

      const container = containerRef.current;

      boardRef.current = new Chessboard(container, {
        position,
        orientation: orientation === 'white' ? COLOR.white : COLOR.black,
        style: {
          cssClass: 'default',
          showCoordinates,
          showBorder: true,
          aspectRatio: 1,
          pieces: {
            file: '/cm-chessboard/pieces/standard.svg'
          }
        },
        responsive: true,
        animationDuration: 300,
        sprite: {
          url: '/cm-chessboard/pieces/standard.svg',
          cache: true
        },
        assetsUrl: '/cm-chessboard/', // Caminho base para sprites de extensões
        extensions: [
          { class: Arrows },
          { class: Markers },
          { class: CustomRightClickAnnotator } // Habilita desenho interativo customizado
        ]
      });

      return () => {
        boardRef.current?.destroy();
        boardRef.current = null;
      };
    }, []); // Apenas na montagem

    // Atualizar posição
    useEffect(() => {
      if (boardRef.current && position) {
        try {
          boardRef.current.setPosition(position, true);
        } catch (error) {
          console.error('Erro ao atualizar posição:', error);
        }
      }
    }, [position]);

    // Atualizar orientação
    useEffect(() => {
      if (boardRef.current) {
        boardRef.current.setOrientation(orientation === 'white' ? COLOR.white : COLOR.black);
      }
    }, [orientation]);

    // Atualizar setas
    useEffect(() => {
      if (!boardRef.current) return;

      boardRef.current.removeArrows();
      arrows.forEach((arrow) => {
        const arrowType =
          arrow.type === 'danger'
            ? ARROW_TYPE.danger
            : arrow.type === 'pointy'
            ? ARROW_TYPE.pointy
            : ARROW_TYPE.default;
        boardRef.current!.addArrow(arrowType, arrow.from, arrow.to);
      });
    }, [arrows]);

    // Atualizar marcadores customizados
    useEffect(() => {
      if (!boardRef.current) return;

      // Remove apenas marcadores customizados (não o lastMove)
      markers.forEach((marker) => {
        const markerType =
          marker.type === 'circle'
            ? MARKER_TYPE.circle
            : marker.type === 'dot'
            ? MARKER_TYPE.dot
            : marker.type === 'square'
            ? MARKER_TYPE.square
            : MARKER_TYPE.frame;
        boardRef.current!.addMarker(markerType, marker.square);
      });
    }, [markers]);

    // Atualizar último movimento
    useEffect(() => {
      if (!boardRef.current) return;

      // Remove apenas marcadores de último movimento
      boardRef.current.removeMarkers(MARKER_TYPE.frame);

      if (lastMove) {
        boardRef.current.addMarker(MARKER_TYPE.frame, lastMove[0]);
        boardRef.current.addMarker(MARKER_TYPE.frame, lastMove[1]);
      }
    }, [lastMove]);

    // Atualizar estado de draggable
    useEffect(() => {
      if (!boardRef.current) return;

      // Sempre desabilita primeiro para evitar erro "moveInput already enabled"
      try {
        boardRef.current.disableMoveInput();
      } catch (e) {
        // Ignora erro se moveInput não estava habilitado
      }

      // Habilita novamente se necessário
      if (isDraggable && onMove) {
        boardRef.current.enableMoveInput((event) => {
          if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
            return onMove(event.squareFrom!, event.squareTo!) ?? true;
          }
          return true;
        }, COLOR.white);
      }
    }, [isDraggable, onMove]);

    // Expor métodos imperativos
    useImperativeHandle(ref, () => ({
      setPosition: (fen: string, animated = true) => {
        if (boardRef.current) {
          boardRef.current.setPosition(fen, animated);
        }
      },
      getPosition: () => {
        return boardRef.current?.getPosition() ?? FEN.start;
      },
      addArrow: (from: string, to: string, type = 'default') => {
        if (!boardRef.current) return;

        const arrowType =
          type === 'danger'
            ? ARROW_TYPE.danger
            : type === 'pointy'
            ? ARROW_TYPE.pointy
            : ARROW_TYPE.default;
        boardRef.current.addArrow(arrowType, from, to);
      },
      clearArrows: () => {
        boardRef.current?.removeArrows();
      },
      addMarker: (square: string, type = 'frame') => {
        if (!boardRef.current) return;

        const markerType =
          type === 'circle'
            ? MARKER_TYPE.circle
            : type === 'dot'
            ? MARKER_TYPE.dot
            : type === 'square'
            ? MARKER_TYPE.square
            : MARKER_TYPE.frame;
        boardRef.current.addMarker(markerType, square);
      },
      clearMarkers: () => {
        boardRef.current?.removeMarkers();
      },
      flip: () => {
        if (!boardRef.current) return;

        const current = boardRef.current.getOrientation();
        boardRef.current.setOrientation(current === COLOR.white ? COLOR.black : COLOR.white);
      },
      setOrientation: (color: 'white' | 'black') => {
        if (boardRef.current) {
          boardRef.current.setOrientation(color === 'white' ? COLOR.white : COLOR.black);
        }
      }
    }));

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      ...style
    };

    const boardStyle: React.CSSProperties = {
      width: width,
      aspectRatio: '1/1'
    };

    return (
      <div style={containerStyle}>
        <div ref={containerRef} style={boardStyle} />
      </div>
    );
  }
);

CMChessboardWrapper.displayName = 'CMChessboardWrapper';

export default CMChessboardWrapper;
