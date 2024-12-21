import { $ } from "../../../base/browser/dom";
import { Orientation } from "./sash/Sash";
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

  layout(offset: number, size: number): void {
    this.splitView.layout(size);
  }

  saveProportions() {
    this.splitView.saveProportions();
  }

  container: HTMLElement;
  _element: HTMLElement;
  splitView: SplitView<SplitViewItemView>;
  options: GridViewOptions;

  constructor(container: HTMLElement, options: GridViewOptions) {
    this.container = container;
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