import { $ } from "../../util/dom";
// import { RenderTerminalItem } from "../../../common/Types";
import { RenderTerminalItem, TabItem } from "../../Types";
import { TabContent } from "./Types";
import { DropOverlay } from "../overlay/DropOverlay";
import { DropTarget } from "../overlay/DropTarget";
import { Term } from "./Term";
import { Group } from "../../Types";
import { Disposable } from '../../../common/base/lifecycle';

export class Contents extends Disposable {
  parent: HTMLElement;
  element: HTMLElement;
  group: Group;
  tabContents: TabContent[];
  wrapper: HTMLElement;
  dropTarget: DropTarget;
  dropOverlay: DropOverlay;

  constructor(parent: HTMLElement, group: Group) {
    super();
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.contents');
    this.tabContents = new Array<Term>(this.group.length);

    /* this.group.map((item, i) => {
      const term = new Term(null, item);
      el.appendChild(term.create());
      this.terms[i] = term;
    }); */

    for (let i = 0; i < this.group.length; i++) {
      let item: TabItem = this.group[i];

      if (item.view) {
        const tabContent: TabContent = item.view;
        if (item.selected) tabContent.element.classList.add('selected');
        if (item.active) tabContent.element.classList.add('active');
        el.appendChild(tabContent.element);
        this.tabContents[i] = tabContent;
      } else {
        if (item.kind === 'settings') {

        } else if (item.kind === 'shortcuts') {

        } else if (item.kind === 'terminal') {
          const term = new Term(null, item);
          el.appendChild(term.create());
          this.tabContents[i] = term;
          item.view = term;
        }
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

  /** 보이는 터미널들을 컨테이너 크기에 맞춘다. 숨겨진 터미널은 Term.fit()에서 걸러진다. */
  fit(): void {
    for (const content of this.tabContents) {
      content.fit();
    }
  }
}
