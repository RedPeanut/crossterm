import { $ } from "../../util/dom";
// import { RenderTerminalItem } from "../../../common/Types";
import { Tab } from "./Tab";
import { Group } from "../../Types";
import { Disposable } from '../../../common/base/lifecycle';

export class Tabs extends Disposable {
  parent: HTMLElement;
  group: Group;
  tabs: Tab[];

  constructor(parent: HTMLElement, group: Group) {
    super();
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const tabs = $('.tabs');
    // const tablist = $('.tablist');
    // console.log('this.group =', this.group);
    this.tabs = new Array<Tab>(this.group.length);
    this.group.map((item, i) => {
      const tab = this.tabs[i] = new Tab(null, item);
      tabs.appendChild(tab.create());
    });
    // tabs.appendChild(tablist);
    return tabs;
  }
}