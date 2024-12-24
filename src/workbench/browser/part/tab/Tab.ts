import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";

export class Tab {
  parent: HTMLElement;
  element: HTMLElement;
  item: TerminalItem;

  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
    this.item = item;
  }
  
  create(): HTMLElement { 
    const el = this.element = $('.tab');
    return el;
  }
}