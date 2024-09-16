import { STATUSBAR_HEIGHT } from '../layout/Workbench';
import { Part } from '../Part';

export class StatusbarPart extends Part {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = STATUSBAR_HEIGHT;
  }

  layoutContainer(offset: number): void {
    this.splitViewContainer.style.top = `${offset}px`;
    this.splitViewContainer.style.height = `${this.size}px`;
  }
}