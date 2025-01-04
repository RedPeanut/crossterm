import { TerminalItem } from "../../../common/Types";
import { $ } from "../../util/dom";
import { SplitViewItemSizeType, SplitViewItemView } from "../../component/SplitView";
import { Tabs } from "../tab/Tabs";
import { Terms } from "../term/Terms";

export interface GroupViewOptions {
  style?: {}
}

export class GroupView implements SplitViewItemView {

  get element(): HTMLElement { return this._element; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  _border: boolean = false;
  get border(): boolean { return this._border; }
  set border(border: boolean) { this._border = border; }
  
  layout(offset: number, size: number): void {}
  
  parent: HTMLElement;
  _element: HTMLElement;
  group: TerminalItem[];
  style: {};

  tabs: Tabs;
  terms: Terms;

  constructor(parent: HTMLElement, group: TerminalItem[], options: GroupViewOptions) {
    this.parent = parent;
    this.group = group;
    this.style = options.style;
  }

  create(): HTMLElement {
    const el = this._element = $('.group-view');
    // el.style = this.style;
    const tabs = this.tabs = new Tabs(el, this.group);
    el.appendChild(tabs.create());
    const terms = this.terms = new Terms(el, this.group);
    el.appendChild(terms.create());
    // this.container.appendChild(el);
    return el;
  }

}