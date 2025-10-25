// Type definitions for cm-chessboard
// Project: https://github.com/shaack/cm-chessboard

declare module 'cm-chessboard' {
  export interface ChessboardConfig {
    position?: string;
    orientation?: COLOR;
    style?: {
      cssClass?: string;
      showCoordinates?: boolean;
      showBorder?: boolean;
      aspectRatio?: number;
      moveFromMarker?: string;
      moveToMarker?: string;
      pieces?: {
        file?: string;
      };
    };
    responsive?: boolean;
    animationDuration?: number;
    sprite?: {
      url?: string;
      size?: number;
      cache?: boolean;
    };
    extensions?: Array<{ class: any; props?: any }>;
  }

  export interface MoveInputEvent {
    type: INPUT_EVENT_TYPE;
    square?: string;
    squareFrom?: string;
    squareTo?: string;
    piece?: string;
  }

  export type MoveInputCallback = (event: MoveInputEvent) => boolean;

  export class Chessboard {
    constructor(element: HTMLElement, config?: ChessboardConfig);

    destroy(): void;
    setPosition(fen: string, animated?: boolean): void;
    getPosition(): string;
    setOrientation(color: COLOR): void;
    getOrientation(): COLOR;
    addMarker(type: any, square: string): void;
    removeMarkers(type?: any, square?: string): void;
    getMarkers(type?: any, square?: string): any[];
    addArrow(type: any, fromSquare: string, toSquare: string): void;
    removeArrows(type?: any, fromSquare?: string): void;
    getArrows(type?: any, fromSquare?: string): any[];
    enableMoveInput(callback: MoveInputCallback, color?: COLOR): void;
    disableMoveInput(): void;
    enableSquareSelect(callback: (square: string) => void): void;
    disableSquareSelect(): void;
  }

  export enum COLOR {
    white = 'w',
    black = 'b'
  }

  export enum INPUT_EVENT_TYPE {
    moveInputStarted = 'moveInputStarted',
    validateMoveInput = 'validateMoveInput',
    moveInputCanceled = 'moveInputCanceled',
    moveInputFinished = 'moveInputFinished'
  }

  export const FEN: {
    start: string;
    empty: string;
  };

  export const SQUARE_SELECT_TYPE: {
    primary: string;
    secondary: string;
  };
}

declare module 'cm-chessboard/src/extensions/arrows/Arrows.js' {
  export class Arrows {
    constructor(board: any, props?: any);
  }

  export const ARROW_TYPE: {
    default: string;
    pointy: string;
    danger: string;
  };
}

declare module 'cm-chessboard/src/extensions/markers/Markers.js' {
  export class Markers {
    constructor(board: any, props?: any);
  }

  export const MARKER_TYPE: {
    frame: string;
    circle: string;
    dot: string;
    square: string;
  };
}

declare module 'cm-chessboard/src/extensions/accessibility/Accessibility.js' {
  export class Accessibility {
    constructor(board: any, props?: any);
  }
}

declare module 'cm-chessboard/src/extensions/right-click-annotator/RightClickAnnotator.js' {
  export class RightClickAnnotator {
    constructor(board: any, props?: any);
  }

  export const ARROW_TYPE: {
    success: { class: string };
    warning: { class: string };
    info: { class: string };
    danger: { class: string };
  };

  export const MARKER_TYPE: {
    success: { class: string; slice: string };
    warning: { class: string; slice: string };
    info: { class: string; slice: string };
    danger: { class: string; slice: string };
  };
}
