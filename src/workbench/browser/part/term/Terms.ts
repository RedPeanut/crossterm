import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";
import { Term } from "./Term";

export class Terms {
    parent: HTMLElement;
    element: HTMLElement;
    group: TerminalItem[];

    constructor(parent: HTMLElement, group: TerminalItem[]) {
      this.parent = parent;
      this.group = group;
    }

    create(): HTMLElement {
      const el = this.element = $('.terms');
      this.group.map((item, i) => {
        const term = new Term(null, item); 
        el.appendChild(term.create());
      });
      return el;
    }
  }