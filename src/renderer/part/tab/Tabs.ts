import { $ } from "../../util/dom";
import { TerminalItem } from "../../../common/Types";
import { Tab } from "./Tab";

export class Tabs {
  parent: HTMLElement;
  group: TerminalItem[];

  constructor(parent: HTMLElement, group: TerminalItem[]) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const tabs = $('.tabs');
    const tablist = $('.tablist');
    // console.log('this.group =', this.group);
    this.group.map((item, i) => {
      const tab = new Tab(null, item);
      tablist.appendChild(tab.create());
    });
    tabs.appendChild(tablist);
    return tabs;
  }
}