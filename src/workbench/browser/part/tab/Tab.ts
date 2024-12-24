import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";

export class Tab {
  container: HTMLElement;
  item: TerminalItem;

  constructor(container: HTMLElement, item: TerminalItem) {
    this.container = container;
  }
  
  create(): HTMLElement { 
    const tab = $('.tab');
    return tab;
  }
}