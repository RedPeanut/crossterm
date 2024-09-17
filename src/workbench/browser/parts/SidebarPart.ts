import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { SIDEBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export class SidebarPart extends Part implements HorizontalViewItem {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this._size = SIDEBAR_WIDTH;
  }

  layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  }
}