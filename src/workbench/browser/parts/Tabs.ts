import { $ } from "../../../base/browser/dom";
import { TerminalItem } from "../../../Types";
import { Tab } from "./Tab";

export class Tabs {
  container: HTMLElement;
  group: TerminalItem[];
  
  constructor(container: HTMLElement, group: TerminalItem[]) {
    this.container = container;
    this.group = group;
  }

  create(): HTMLElement {
    const tabs = $('.tabs');
    const tablist = $('.tablist');
    console.log('this.group =', this.group);
    this.group.map((item, i) => {
      const tab = new Tab(null, item); 
      tablist.appendChild(tab.create());
    });
    tabs.appendChild(tablist);
    return tabs;
  }
}