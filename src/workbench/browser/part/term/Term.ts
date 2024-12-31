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

  createTerminal(): void {
    let retVal = window.ipc.send('new', {
      // ...item,
      // uid: this.uid,
      type: 'local',
      size: { col: 80, row: 24 },
      url: { protocol: '', user: '', resource: '', port: '' }
    });
    // console.log('retVal =', retVal);
  }
}