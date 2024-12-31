import { TerminalItem } from "../../../common/Types";
import { $ } from "../../util/dom";

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