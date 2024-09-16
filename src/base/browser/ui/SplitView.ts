import { append, $ } from "../dom";
import { Orientation, Sash } from "./sash/Sash";

export interface SplitViewItem {
  getElement(): HTMLElement;
  layoutContainer(offset: number): void;
}

/** The interface to implement for views within a {@link SplitView}.
export interface SplitViewItem { 
  element?: HTMLElement;
  mainContainer?: HTMLElement;
} */

/* export abstract class SplitViewItem {
  element: HTMLElement;
  get element(): HTMLElement {}
} */

export interface ISplitViewItemView {
  element: HTMLElement;
  minimumSize: number;
  maximumSize: number;
}

/* export abstract class SplitViewItem {
  _size: number;
  set size(size: number) { this._size = size; }
  get size(): number { return this._size; }

  // container: HTMLElement;
  // view: TView;
  _element: HTMLElement;
  // set element(element: HTMLElement) { this._element = element; }
  get element(): HTMLElement { return this._element; }

  constructor(element: HTMLElement) {
    this._element = element;
    // this.view = view;
  }

  layout(offset: number): void {}
  abstract layoutContainer(offset: number): void;
} */

interface ISashDragState {}

export interface ISplitViewOptions {
  orientation?: Orientation;
}

export class SplitView {

  container: HTMLElement;
  orientation: Orientation;
  viewItems: SplitViewItem[] = [];
  el: HTMLElement;
  //viewItems: ViewItem[];
  sashContainer: HTMLElement;
  viewContainer: HTMLElement;
  sashDragState: ISashDragState | undefined;

  constructor(container: HTMLElement, options: ISplitViewOptions) {
    this.container = container;
    this.orientation = options.orientation != null ? options.orientation : Orientation.VERTICAL;
    // this.viewItems = [];

    this.el = document.createElement('div');
    this.el.classList.add('split-view');
    this.el.classList.add(this.orientation === Orientation.VERTICAL ? 'vertical' : 'horizontal');
    this.sashContainer = append(this.el, $('.sash-container'));
    this.viewContainer = append(this.el, $('.split-view-container'));
    this.container.appendChild(this.el);
  }

  removeView(index: number): SplitViewItem {
    // not implemented yet
    return null;
  }

  addView(item: SplitViewItem, index: number = this.viewItems.length) {
    // add view
    const div = $('.split-view-view');
    if(index === this.viewItems.length)
      this.viewContainer.appendChild(div);
    else
      this.viewContainer.insertBefore(div, this.viewContainer.children.item(index));
    this.viewItems.splice(index, 0, item);

    // add sash
    if(this.viewItems.length > 1) {
      const sash = new Sash(this.sashContainer, null);
    }

    // // append
    // const child = view.mainContainer ? view.mainContainer : view.element;
    div.appendChild(item.getElement());
  }

  layout(size: number) {
    let total = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
    }
  }

  /* render() {
    this.viewItems.map((e: SplitViewItem, idx: number) => {
      let bar = null, sash;
    });
  } */

}