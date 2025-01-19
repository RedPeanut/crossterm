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
  wrapper: HTMLElement;
  dropTarget: DropTarget;
  dropOverlay: DropOverlay;

  constructor(parent: HTMLElement, group: TerminalItem[]) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.terms');
    this.terms = new Array<Term>(this.group.length);

    /* this.group.map((item, i) => {
      const term = new Term(null, item);
      el.appendChild(term.create());
      this.terms[i] = term;
    }); */

    for(let i = 0; i < this.group.length; i++) {
      let item: TerminalItem = this.group[i];
      if(item.term) {
        const term: Term = item.term;
        el.appendChild(term.element);
        this.terms[i] = term;
      } else {
        const term = new Term(null, item);
        el.appendChild(term.create());
        this.terms[i] = term;
        item.term = term;
      }
    }

    const wrapper = this.wrapper = $('.wrapper');
    const dropTarget = this.dropTarget = new DropTarget(null, this.group);
    wrapper.appendChild(dropTarget.create());
    const dropOverlay = this.dropOverlay = new DropOverlay(null, this.group, dropTarget);
    wrapper.appendChild(dropOverlay.create());
    wrapper.style.display = 'none';
    el.appendChild(wrapper);

    return el;
  }
}
