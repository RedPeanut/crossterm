import { SplitViewItem, SplitViewItemSizeType, SplitViewItemView } from "../../base/browser/ui/SplitView";
import { Component } from "../common/Component";

export interface PartOptions {
  // sizeType?: SplitViewItemSizeType;
}

class PartLayout {
  constructor(private options: PartOptions, private contentArea: HTMLElement | undefined) { }
}

export abstract class Part extends Component implements SplitViewItemView {

  get element(): HTMLElement { return this.contentArea; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  layout(offset: number, size: number): void {}

  /* set size(size: number) {
    this._size = size;
  }

  get size(): number {
    return this._size;
  }

  get element(): HTMLElement {
    return this.contentArea;
  }

  set splitViewContainer(container: HTMLElement) {
    this._splitViewContainer = container;
  }

  get splitViewContainer() {
    return this._splitViewContainer;
  }

  set sizeType(sizeType: SplitViewItemSizeType) {
    this._sizeType = sizeType;
  }

  get sizeType(): SplitViewItemSizeType {
    return this._sizeType;
  }

  abstract layoutContainer(offset: number): void;

  _size: number = 0;
  _splitViewContainer: HTMLElement | undefined;
  _sizeType: SplitViewItemSizeType = 'wrap_content';

  _cachedVisibleSize: number | undefined = undefined;
  set cachedVisibleSize(cachedVisibleSize: number) { this._cachedVisibleSize = cachedVisibleSize; }
  get cachedVisibleSize(): number | undefined { return this._cachedVisibleSize; }
  get visible(): boolean {
    return typeof this._cachedVisibleSize === 'undefined';
  }

  setVisible(visible: boolean): void {

    if(visible === this.visible) {
      return;
    }

    if(visible) {
      this.size = this._cachedVisibleSize;
      this._cachedVisibleSize = undefined;
    } else {
      this._cachedVisibleSize = this.size;
      this.size = 0;
    }
    this.splitViewContainer.classList.toggle('visible', visible);
  } */

  parent: HTMLElement | undefined;
  headerArea: HTMLElement | undefined;
  titleArea: HTMLElement | undefined;
  contentArea: HTMLElement | undefined;
  footerArea: HTMLElement | undefined;
  partLayout: PartLayout | undefined;

  role: string;
  classes: string[];
  // options: object;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: PartOptions) {
    super(id);
    this.parent = parent;
    this.role = role;
    this.classes = classes;
    // this.options = options;
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
    // this.partLayout = new PartLayout(this.options, this.contentArea);
    this.titleArea && this.parent && this.parent.appendChild(this.titleArea);
    this.contentArea && this.parent && this.parent.appendChild(this.contentArea);
  }
  
  createTitleArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', 'content-area', ...this.classes);
    part.id = this.getId();
    part.setAttribute('role', this.role);
    return part;
  }

  // abstract toJSON(): object;
}