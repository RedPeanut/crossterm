import { $ } from "../../../base/browser/dom";
import { TerminalItem } from "../../../Types";

export class Term {
  container: HTMLElement;
  item: TerminalItem;
  
  constructor(container: HTMLElement, item: TerminalItem) {
    this.container = container;
  }
  
  create(): HTMLElement {
    const term = $('.term');
    return term;
  }
}