import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { ACTIVITYBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export class ActivitybarPart extends Part implements HorizontalViewItem {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = ACTIVITYBAR_WIDTH;
  }

  layoutContainer(offset: number): void {
    this.splitViewContainer.style.left = `${offset}px`;
    this.splitViewContainer.style.width = `${this.size}px`;
  }
}