export declare const ARROW_TYPE: {
  success: { class: string };
  warning: { class: string };
  info: { class: string };
  danger: { class: string };
};

export declare const MARKER_TYPE: {
  success: { class: string; slice: string };
  warning: { class: string; slice: string };
  info: { class: string; slice: string };
  danger: { class: string; slice: string };
};

export declare class CustomRightClickAnnotator {
  constructor(chessboard: any, props?: any);
  destroy(): void;
  getAnnotations(): any;
  setAnnotations(annotations: any): void;
}
