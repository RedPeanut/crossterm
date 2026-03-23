import { MappedSashEvent, SplitViewItem, SplitViewItemSizeType, SplitViewItemView } from "./component/SplitView";
import { Component } from "./Component";
import { Parts } from "./layout/MainLayout";

export interface _PartOptions {
  id: Parts;
  role: string;
  classes: string[];
  // sizeType: SplitViewItemSizeType;
}

export type PartOptions = Partial<_PartOptions>;

export abstract class Part implements SplitViewItemView {

  // _element: HTMLElement;
  get element(): HTMLElement { return this.container; }
  set element(e: HTMLElement) { this.container = e; }

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

  container: HTMLElement | undefined;
  headerArea: HTMLElement | undefined;
  titleArea: HTMLElement | undefined;
  contentArea: HTMLElement | undefined;
  footerArea: HTMLElement | undefined;
  options: PartOptions;

  constructor(container: HTMLElement, options: PartOptions) {
    this.container = container;
    this.options = options;
    if(options) {
      // this._sizeType = options.sizeType;
    }
  }

  getContentArea(): HTMLElement | undefined {
    return this.contentArea;
  }

  create(): void {
    this.titleArea = this.createTitleArea();
    this.contentArea = this.createContentArea();
  }

  createTitleArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(): HTMLElement {
    this.container = document.createElement('div');
    this.container.id = this.options.id;
    this.container.classList.add('part', ...this.options.classes);
    return this.container;
  }

  // abstract toJSON(): object;
}