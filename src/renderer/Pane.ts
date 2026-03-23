import { MappedSashEvent, SplitViewItemSizeType, SplitViewItemView } from "./component/SplitView";
import { $, append } from "./util/dom";

export interface PaneOptions {}

export abstract class Pane implements SplitViewItemView {
  static HEADER_SIZE = 22;

  _element: HTMLElement;
  get element(): HTMLElement { return this._element; }
  set element(e: HTMLElement) { this._element = e; }

  _size: number = 0;
  get size(): number { return this._size ? this._size : this.minimumSize; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(ty: SplitViewItemSizeType) { this._sizeType = ty; }

  _minimumSize: number = 0;
  get minimumSize(): number {
    const headerSize = this.headerSize;
    const expanded = this.expanded;
    const minimumBodySize = expanded ? this.minimumBodySize : 0;
    return headerSize + minimumBodySize;
  }
  set minimumSize(n: number) { this._minimumSize = n; }

  _maximumSize: number = Number.POSITIVE_INFINITY;
  get maximumSize(): number {
    const headerSize = this.headerSize;
    const expanded = this.expanded;
    const maximumBodySize = expanded ? this.maximumBodySize : 0;
    return headerSize + maximumBodySize;
  }
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

  _expanded: boolean = true;
  get expanded(): boolean { return this._expanded; }
  set expanded(b: boolean) {
    this.element.classList.toggle('expanded', b);
    this._expanded = b;
  }

  get headerSize(): number { return Pane.HEADER_SIZE; }

  _minimumBodySize: number = 0;
  get minimumBodySize(): number { return this._minimumBodySize; }
  set minimumBodySize(n: number) { this._minimumBodySize = n; }

  _maximumBodySize: number = 0;
  get maximumBodySize(): number { return this._maximumBodySize; }
  set maximumBodySize(size: number) { this._maximumBodySize = size; }

  parent: HTMLElement;
  options: any;
  header: HTMLElement;
  body: HTMLElement;

  constructor(parent: HTMLElement, options: PaneOptions) {
    this.parent = parent;
    this.options = options;
    this.element = $('.pane');
  }

  render(): void {
    this.header = append(this.element, $('.pane-header'));
    this.renderHeader(this.header);
    this.body = append(this.element, $('.pane-body'));
    this.renderBody(this.body);
  }

  abstract renderHeader(container: HTMLElement): void;
  abstract renderBody(container: HTMLElement): void;
}