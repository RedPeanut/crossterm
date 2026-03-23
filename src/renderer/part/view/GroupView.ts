import { TerminalItem } from "../../../common/Types";
import { $ } from "../../util/dom";
import { MappedSashEvent, SplitViewItemSizeType, SplitViewItemView } from "../../component/SplitView";
import { Tabs } from "../tab/Tabs";
import { Terms } from "../term/Terms";
import { Group } from "../../Types";

export interface GroupViewOptions {
  style?: {}
}

export class GroupView implements SplitViewItemView {

  _element: HTMLElement;
  get element(): HTMLElement { return this._element; }
  set element(e: HTMLElement) { this._element = e; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(ty: SplitViewItemSizeType) { this._sizeType = ty; }

  _minimumSize: number = 0;
  get minimumSize(): number { return this._minimumSize; }
  set minimumSize(n: number) { this._minimumSize = n; }

  _maximumSize: number = Number.POSITIVE_INFINITY;
  get maximumSize(): number { return this._maximumSize; }
  set maximumSize(n: number) { this._maximumSize = n; }

  _border: boolean = false;
  get border(): boolean { return this._border; }
  set border(b: boolean) { this._border = b; }

  _sashEnablement: boolean = true;
  get sashEnablement(): boolean { return this._sashEnablement; }
  set sashEnablement(b: boolean) { this._sashEnablement = b; }

  layout(offset: number, size: number): void {}
  onDidChange(mappedEvent: MappedSashEvent): void {}
  doWhenVisible(visible: boolean): void {}

  parent: HTMLElement;
  group: Group;
  style: {};

  tabs: Tabs;
  terms: Terms;

  constructor(parent: HTMLElement, group: Group, options: GroupViewOptions) {
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