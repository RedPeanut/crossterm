import { $, getClientArea } from "../../util/dom";
import { Orientation } from "../../component/Sash";
import { MappedSashEvent, SplitView, SplitViewItemSizeType, SplitViewItemView, SplitViewOptions } from "../../component/SplitView";

export interface OrientationViewOptions {
  orientation?: Orientation;
  style?: {};
  length: number;
}

/**
 * TODO: serialize n deserialize ?
 */
export class OrientationView implements SplitViewItemView {

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
  onDidChange(mappedEvent: MappedSashEvent): void {}
  doWhenVisible(visible: boolean): void {}

  parent: HTMLElement;
  splitView: SplitView<SplitViewItemView>;
  options: OrientationViewOptions;

  constructor(parent: HTMLElement, options: OrientationViewOptions) {
    this.parent = parent;
    this.options = options;
  }

  create(): HTMLElement {
    const el = this._element = $('.orientation-view');
    const options: SplitViewOptions<OrientationView> = { orientation: this.options.orientation };
    this.splitView = new SplitView(el, options);
    return el;
  }

  addView(view: SplitViewItemView): void {
    this.splitView.addView(view);
  }

}