import { TerminalItem } from "../../../../Types";
import { $ } from "../../../../base/browser/dom";
import { SplitViewItemSizeType, SplitViewItemView } from "../../../../base/browser/ui/SplitView";
import { Tabs } from "../Tabs";
import { Terms } from "../Terms";

export class GroupView implements SplitViewItemView {

  get element(): HTMLElement { return this._element; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  layout(offset: number, size: number): void {}
  
  container: HTMLElement;
  _element: HTMLElement;
  group: TerminalItem[];

  constructor(container: HTMLElement, group: TerminalItem[]) {
    this.container = container;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this._element = $('.group-view');
    const tabs = new Tabs(el, this.group);
    tabs.create();
    const terms = new Terms(el, this.group);
    terms.create();
    // this.container.appendChild(el);
    return null;
  }

}