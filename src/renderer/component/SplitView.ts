import { append, $ } from "../util/dom";
import { Orientation, Sash } from "./Sash";

export type SplitViewItemSizeType = 'match_parent' | 'fill_parent' | 'wrap_content';

/* export interface SplitViewItem {

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
export interface HorizontalViewItem {} */

export interface SplitViewItemView {
  get element(): HTMLElement;
  get size(): number;
  set size(size: number);
  get sizeType(): SplitViewItemSizeType;
  set sizeType(sizeType: SplitViewItemSizeType);
  get border(): boolean;
  set border(border: boolean);
  layout(offset: number, size: number): void;
}

export abstract class SplitViewItem<T extends SplitViewItemView> {

  _cachedVisibleSize: number | undefined = undefined;
  get cachedVisibleSize(): number | undefined { return this._cachedVisibleSize; }
  set cachedVisibleSize(cachedVisibleSize: number | undefined) { this._cachedVisibleSize = cachedVisibleSize; }

  get visible(): boolean {
    return typeof this._cachedVisibleSize === 'undefined';
  }

  setVisible(visible: boolean): void {

    if(visible === this.visible) {
      return;
    }

    if(visible) {
      this.view.size = this.cachedVisibleSize;
      this.cachedVisibleSize = undefined;
    } else {
      this.cachedVisibleSize = this.view.size;
      this.view.size = 0;
    }
    this._container.classList.toggle('visible', visible);
  }

  _view: T;
  get view() { return this._view; }

  _container: HTMLElement;
  get container() { return this._container; }

  constructor(
    container: HTMLElement
    , view: T
  ) {
    this._container = container;
    this._view = view;
  }

  abstract layoutContainer(offset: number): void;
}

export class VerticalViewItem<T extends SplitViewItemView> extends SplitViewItem<T> {
  layoutContainer(offset: number): void {
    this.container.style.top = `${offset}px`;
    this.container.style.height = `${this.view.size}px`;
    this.view.layout(offset, this.view.size);
  }
}

export class HorizontalViewItem<T extends SplitViewItemView> extends SplitViewItem<T> {
  layoutContainer(offset: number): void {
    this.container.style.left = `${offset}px`;
    this.container.style.width = `${this.view.size}px`;
    this.view.layout(offset, this.view.size);
  }
}

interface SashDragState {}

export interface SplitViewOptions {
  orientation?: Orientation;
}

export class SplitView<T extends SplitViewItemView> {

  size: number;
  container: HTMLElement;
  orientation: Orientation;
  viewItems: SplitViewItem<T>[] = [];
  el: HTMLElement;
  //viewItems: ViewItem[];
  sashContainer: HTMLElement;
  viewContainer: HTMLElement;
  sashDragState: SashDragState | undefined;
  proportions: (number | undefined)[] | undefined = undefined;

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

  replaceView(_old: T, _new: T) {
    // remove n add
    for(let i = 0; i < this.viewItems.length; i++) {
      if(_old === this.viewItems[i].view) {
        const container = $('.split-view-view');

        this.viewContainer.insertBefore(container, this.viewContainer.children.item(i));
        this.viewContainer.removeChild(this.viewContainer.children.item(i+1));

        const item = this.orientation === Orientation.VERTICAL
          ? new VerticalViewItem(container, _new)
          : new HorizontalViewItem(container, _new);
        const viewItemToRemove = this.viewItems.splice(i, 1, item)[0];

        container.appendChild(_new.element);
        break;
      }
    }
  }

  removeView(index: number): SplitViewItem<T> {
    // not implemented yet
    return null;
  }

  addView(view: T, index: number = this.viewItems.length) {
    // add view
    const container = $('.split-view-view');
    // item.splitViewContainer = container;

    if(index === this.viewItems.length)
      this.viewContainer.appendChild(container);
    else
      this.viewContainer.insertBefore(container, this.viewContainer.children.item(index));
    const item = this.orientation === Orientation.VERTICAL
      ? new VerticalViewItem(container, view)
      : new HorizontalViewItem(container, view);
    this.viewItems.splice(index, 0, item);

    // add sash
    if(this.viewItems.length > 1) {
      const sash = new Sash(this.sashContainer, null);
    }

    // append
    container.appendChild(view.element);
  }

  saveProportions() {
    this.proportions = [this.viewItems.length];
    for(let i = 0; i < this.viewItems.length; i++)
      this.proportions[i] = 1 / this.viewItems.length;
    // console.log('this.proportions =', this.proportions);
  }

  /**
   * Sizing from total size
   * @param totalSize Total size
   */
  layout(totalSize: number) {
    this.size = totalSize;

    if(this.proportions) {
      let total = 0;
      for(let i = 0; i < this.viewItems.length; i++) {
        const item = this.viewItems[i];
        item.view.size = totalSize * this.proportions[i];
      }
      this.layoutViews();
    } else {
      let total = 0;
      for(let i = 0; i < this.viewItems.length; i++) {
        const item = this.viewItems[i];
        if(item.view.sizeType === 'wrap_content') {
          let itemSize = (item.view.border ? 1 : 0) + item.view.size;
          total += itemSize;
          totalSize -= itemSize;
        }
      }

      // fill empty space (dangling implementation)
      for(let i = 0; i < this.viewItems.length; i++) {
        const item = this.viewItems[i];
        if(item.view.sizeType === 'fill_parent') {
          item.view.size = totalSize - (item.view.border ? 1 : 0);
        }
      }

      this.layoutViews();
    }
  }

  layoutViews(): void {
    let offset = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const item = this.viewItems[i];
      item.layoutContainer((item.view.border ? 1 : 0) + offset);
      // console.log(`[${i}] ${item.size}`);
      offset += (item.view.border ? 1 : 0) + item.view.size;
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