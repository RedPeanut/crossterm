import { $, append } from "../../dom";

export const enum Orientation {
  VERTICAL,
  HORIZONTAL
}

export interface SashEvent {
  readonly startX: number;
  readonly currentX: number;
  readonly startY: number;
  readonly currentY: number;
  readonly altKey: boolean;
}

export interface SashOptions {
  readonly orientation: Orientation;
  readonly size?: number;
}

export class Sash {
  el: HTMLElement;

  constructor(container: HTMLElement, options: SashOptions) {
    this.el = append(container, $('.sash'));
    
    this.el.addEventListener('mousedown', (e) => {});
    this.el.addEventListener('dblclick', (e) => {});
    this.el.addEventListener('mouseenter', (e) => {});
    this.el.addEventListener('mouseleave', (e) => {});
    this.el.addEventListener('touchstart', (e) => {});
  }
}