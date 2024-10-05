import { Service, sidebarPartServiceId } from '../../../service';
import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { Composite } from '../Composite';
import { SIDEBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export interface SidebarPartService extends Service {
  showComposite(composite: Composite): void;
  getActiveComposite(): Composite | undefined;
  hideActiveComposite(): Composite | undefined;
}

export class SidebarPart extends Part implements HorizontalViewItem, SidebarPartService {

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this._size = SIDEBAR_WIDTH;
  }

  layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  }

  showComposite(composite: Composite): void {
  }

  getActiveComposite(): Composite | undefined {
    return undefined;
  }

  hideActiveComposite(): Composite | undefined {
    return undefined;
  }

}