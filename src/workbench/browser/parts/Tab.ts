import { TerminalItem } from "../../../Types";

export class Tab {
  container: HTMLElement;
  item: TerminalItem;
  
  constructor(container: HTMLElement, item: TerminalItem) {
    this.container = container;
  }
  
  create(): HTMLElement { return null; }
}