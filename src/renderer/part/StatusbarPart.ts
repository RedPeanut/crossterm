import { STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';

export class StatusbarPart extends Part {
  constructor(parent: HTMLElement, options: object) {
    super(parent, options);
    // this.size = STATUSBAR_HEIGHT;
    // this.sashEnablement = false;
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}