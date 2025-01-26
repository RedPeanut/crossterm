import { SplitViewItem, SplitViewItemSizeType, SplitViewItemView } from "./component/SplitView";
import { Component } from "./Component";

export interface PartOptions {
  // sizeType?: SplitViewItemSizeType;
}

export abstract class Part extends Component implements SplitViewItemView {

  get element(): HTMLElement { return this.contentArea; }

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

  parent: HTMLElement | undefined;
  headerArea: HTMLElement | undefined;
  titleArea: HTMLElement | undefined;
  contentArea: HTMLElement | undefined;
  footerArea: HTMLElement | undefined;

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
    // this.titleArea && this.parent && this.parent.appendChild(this.titleArea);
    // this.contentArea && this.parent && this.parent.appendChild(this.contentArea);
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