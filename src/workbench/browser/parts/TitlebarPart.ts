import { VerticalViewItem } from '../../../base/browser/ui/SplitView';
import { TITLEBAR_HEIGHT } from '../layout/Workbench';
import { Part } from '../Part';

export class TitlebarPart extends Part implements VerticalViewItem {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
  }

  layoutContainer(offset: number): void {
    this.splitViewContainer.style.top = `${offset}px`;
    this.splitViewContainer.style.height = `${this.size}px`;
  }
}