import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { SIDEBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export class SidebarPart extends Part implements HorizontalViewItem {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = SIDEBAR_WIDTH;
  }

  layoutContainer(offset: number): void {
    this.splitViewContainer.style.left = `${offset}px`;
    this.splitViewContainer.style.width = `${this.size}px`;
  }
}