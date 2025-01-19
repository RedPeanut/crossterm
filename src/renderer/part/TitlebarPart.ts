import { VerticalViewItem } from '../component/SplitView';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';

export class TitlebarPart extends Part {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
    // this.border = true;
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}