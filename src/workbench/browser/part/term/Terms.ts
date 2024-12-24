import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";
import { Term } from "./Term";

export class Terms {
    container: HTMLElement;
    group: TerminalItem[];
    constructor(container: HTMLElement, group: TerminalItem[]) {
      this.container = container;
      this.group = group;
    }

    create(): HTMLElement {
      const terms = $('.terms');
      this.group.map((item, i) => {
        const term = new Term(null, item); 
        terms.appendChild(term.create());
      });
      return terms;
    }
  }