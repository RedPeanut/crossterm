import { $ } from "../../util/dom";
import { TerminalItem } from "../../../common/Types";
import { DropOverlay } from "../overlay/DropOverlay";
import { DropTarget } from "../overlay/DropTarget";
import { Term } from "./Term";

export class Terms {
    parent: HTMLElement;
    element: HTMLElement;
    group: TerminalItem[];
    terms: Term[];

    constructor(parent: HTMLElement, group: TerminalItem[]) {
      this.parent = parent;
      this.group = group;
    }

    create(): HTMLElement {
      const el = this.element = $('.terms');
      this.terms = new Array<Term>(this.group.length);
      this.group.map((item, i) => {
        const term = new Term(null, item); 
        el.appendChild(term.create());
        this.terms[i] = term;
      });

      const dropTarget = new DropTarget(null, this.group); 
      el.appendChild(dropTarget.create());
      const dropOverlay = new DropOverlay(null, this.group, dropTarget);
      el.appendChild(dropOverlay.create());
      return el;
    }
  }