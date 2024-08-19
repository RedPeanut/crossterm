import { $, append } from "../../dom";

export const enum Orientation {
  VERTICAL,
  HORIZONTAL
}

export interface ISashEvent {
  readonly startX: number;
  readonly currentX: number;
  readonly startY: number;
  readonly currentY: number;
  readonly altKey: boolean;
}

export interface ISashOptions {
  readonly orientation: Orientation;
  readonly size?: number;
}

export class Sash {
  el: HTMLElement;

  constructor(container: HTMLElement, options: ISashOptions) {
    this.el = append(container, $('.sash'));
    
    this.el.addEventListener('mousedown', (e) => {});
    this.el.addEventListener('dblclick', (e) => {});
    this.el.addEventListener('mouseenter', (e) => {});
    this.el.addEventListener('mouseleave', (e) => {});
    this.el.addEventListener('touchstart', (e) => {});
  }
}