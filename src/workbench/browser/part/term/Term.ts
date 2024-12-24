import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";

export class Term {
  parent: HTMLElement;
  item: TerminalItem;
  
  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
  }
  
  create(): HTMLElement {
    const term = $('.term');
    return term;
  }
}