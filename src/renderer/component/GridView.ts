import { $, getClientArea } from "../util/dom";
import { Orientation } from "./Sash";
import { SplitView, SplitViewItemSizeType, SplitViewItemView, SplitViewOptions } from "./SplitView";

export interface GridViewOptions {
  orientation?: Orientation;
  style?: {};
  length: number;
}

/**
 * TODO: serialize n deserialize ?
 * 
 */
export class GridView implements SplitViewItemView {

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

  layout(offset: number, size: number): void {
    // console.log('size =', size);
    // console.trace();
    let dimension = getClientArea(this.element);
    // console.log('dimension =', dimension);
    this.splitView.saveProportions();
    if(this.splitView.orientation === Orientation.HORIZONTAL)
      this.splitView.layout(dimension.width);
    else
      this.splitView.layout(dimension.height);
  }

  parent: HTMLElement;
  _element: HTMLElement;
  splitView: SplitView<SplitViewItemView>;
  options: GridViewOptions;

  constructor(parent: HTMLElement, options: GridViewOptions) {
    this.parent = parent;
    this.options = options;
  }

  create(): HTMLElement {
    const el = this._element = $('.grid-view');
    const options: SplitViewOptions = { orientation: this.options.orientation };
    this.splitView = new SplitView(el, options);
    return el;
  }

  addView(view: SplitViewItemView): void {
    this.splitView.addView(view);
  }

}