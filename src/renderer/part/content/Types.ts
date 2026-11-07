// export type Content = Term | Settings | Shortcuts;
export interface TabContent {
  element: HTMLElement;
  create(): HTMLElement;
  fit(): void;
  // dispose(): void;
}