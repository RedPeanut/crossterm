import { append, $ } from "../dom";
import { Orientation, Sash } from "./sash/Sash";

export type SplitViewItemSizeType = 'match_parent' | 'fill_parent' | 'wrap_content';

export interface SplitViewItem {
  
  // getSize(): number;
  // setSize(size: number): void;
  // getElement(): HTMLElement;
  // setSplitViewContainer(container: HTMLElement): void;

  get size(): number;
  set size(size: number);
  get element(): HTMLElement;
  get splitViewContainer(): HTMLElement;
  set splitViewContainer(container: HTMLElement);
  set sizeType(sizeType: SplitViewItemSizeType);
  get sizeType(): SplitViewItemSizeType;

  layoutContainer(offset: number): void;

  set cachedVisibleSize(cachedVisibleSize: number | undefined);
  get cachedVisibleSize(): number | undefined;
  setVisible(visible: boolean): void;
}

export interface VerticalViewItem {}
export interface HorizontalViewItem {}

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

interface SashDragState {}

export interface SplitViewOptions {
  orientation?: Orientation;
}

export class SplitView {

  size: number;
  container: HTMLElement;
  orientation: Orientation;
  viewItems: SplitViewItem[] = [];
  el: HTMLElement;
  //viewItems: ViewItem[];
  sashContainer: HTMLElement;
  viewContainer: HTMLElement;
  sashDragState: SashDragState | undefined;

  constructor(container: HTMLElement, options: SplitViewOptions) {
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
    const container = $('.split-view-view');
    item.splitViewContainer = container;

    if(index === this.viewItems.length)
      this.viewContainer.appendChild(container);
    else
      this.viewContainer.insertBefore(container, this.viewContainer.children.item(index));
    this.viewItems.splice(index, 0, item);

    // add sash
    if(this.viewItems.length > 1) {
      const sash = new Sash(this.sashContainer, null);
    }

    // // append
    // const child = view.mainContainer ? view.mainContainer : view.element;
    container.appendChild(item.element);
  }

  layout(size: number) {
    this.size = size;
    let total = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
      if(item.sizeType === 'wrap_content') {
        total += item.size;
        size -= item.size;
      }
    }

    // fill empty space
    for(let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
      if(item.sizeType === 'fill_parent') {
        item.size = size;
      }
    }

    this.layoutViews();
  }

  layoutViews(): void {
    let offset = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
      item.layoutContainer(offset);
      // console.log(`[${i}] ${item.size}`);
      offset += item.size;
    }
  }

  /* render() {
    this.viewItems.map((e: SplitViewItem, idx: number) => {
      let bar = null, sash;
    });
  } */

  setViewVisible(index: number, visible: boolean): void {
    if(index < 0 || index >= this.viewItems.length) {
      throw new Error('Index out of bounds');
    }

    const viewItem = this.viewItems[index];
    viewItem.setVisible(visible);

    this.layoutViews();
  }
}