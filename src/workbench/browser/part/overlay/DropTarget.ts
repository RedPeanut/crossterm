import { TerminalItem } from "../../../../Types";
import { $ } from "../../../../base/browser/dom";

export interface DropTargetOptions {}

export class DropTarget {
  
  parent: HTMLElement;
  element: HTMLElement;
  group: TerminalItem[];

  constructor(parent: HTMLElement, group: TerminalItem[]) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.drop-target');

    return el;
  }

}