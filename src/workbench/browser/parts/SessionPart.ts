import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { Part } from '../Part';

export class SessionPart extends Part /* implements HorizontalViewItem */ {
  
  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    // this.size = SESSION_WIDTH;
    this.sizeType = 'fill_parent';
  }
}