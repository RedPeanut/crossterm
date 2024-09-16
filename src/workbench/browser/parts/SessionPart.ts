import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { Part } from '../Part';

export class SessionPart extends Part implements HorizontalViewItem {
  layoutContainer(offset: number): void {
    this.splitViewContainer.style.left = `${offset}px`;
    this.splitViewContainer.style.width = `${this.size}px`;
  }
}