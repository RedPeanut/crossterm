import { EventEmitter } from "events";
import { append, $ } from "../util/dom";
import { Orientation, Sash, SashEvent, SashState } from "./Sash";
import { range } from "../util/arrays";

interface MappedSashEvent {
  sash: Sash;
  start: number;
  current: number;
  alt: boolean;
}

interface SashDragItemState {
  readonly index: number;
  readonly limitDelta: number;
  readonly size: number;
}

interface SashDragState {
  index: number;
  start: number;
  current: number;
  sizes: number[];
  minDelta: number;
  maxDelta: number;
  // alt: boolean;
  beforeItem: SashDragItemState;
  afterItem: SashDragItemState;
}

interface SashItem {
  sash: Sash;
}

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
  get sashEnablement(): boolean;
  set sashEnablement(b: boolean);
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

export interface SplitViewOptions {
  orientation?: Orientation;
}

export class SplitView<T extends SplitViewItemView> {

  size: number;
  container: HTMLElement;
  orientation: Orientation;
  viewItems: SplitViewItem<T>[] = [];
  el: HTMLElement;
  sashItems: SashItem[] = [];
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

  getSashPosition(sash: Sash): number {
    let position = 0;
    for(let i = 0; i < this.sashItems.length; i++) {
      position += this.viewItems[i].view.size;
      if(this.sashItems[i].sash === sash)
        return position;
    }
    return 0;
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
      const sash = this.orientation === Orientation.VERTICAL
        ? new Sash(this.sashContainer, { getHorizontalSashTop: s => this.getSashPosition(s), getHorizontalSashWidth: null }, { orientation: Orientation.HORIZONTAL })
        : new Sash(this.sashContainer, { getVerticalSashLeft: s => this.getSashPosition(s), getVerticalSashHeight: null }, { orientation: Orientation.VERTICAL });

      sash.state = view.sashEnablement ? SashState.Enabled : SashState.Disabled;

      const sashEventMapper = this.orientation === Orientation.VERTICAL
        ? (e: SashEvent) => ({ sash, start: e.startY, current: e.currentY, alt: e.altKey })
        : (e: SashEvent) => ({ sash, start: e.startX, current: e.currentX, alt: e.altKey });

      sash.on('sash start', (e) => {
        // console.log('sash start event is called.. e =', e);
        const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
        this.onSashStart(mappedEvent);
      });
      sash.on('sash change', (e) => {
        // console.log('sash change event is called.. e =', e);
        const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
        this.onSashChange(mappedEvent);
      });
      sash.on('sash end', (e) => {
        console.log('sash end event is called.. e =', e);
        // const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
      });

      const sashItem: SashItem = { sash };
      this.sashItems.splice(index-1, 0, sashItem);
    }

    // append
    container.appendChild(view.element);
  }

  findFirstIndex(indexes: number[]): number | undefined {
    /* for(const index of indexes) {
      const viewItem = this.viewItems[index];
      return index;
    } */
    return undefined;
  }

  onSashStart({ sash, start }: MappedSashEvent): void {
    const index = this.sashItems.findIndex(item => item.sash === sash);
    // console.log('index =', index);

    const resetSashDragState = (start: number) => {
      const sizes = this.viewItems.map(i => i.view.size);
      // console.log('sizes =', sizes);

      let minDelta = Number.NEGATIVE_INFINITY;
      let maxDelta = Number.POSITIVE_INFINITY;

      let beforeItem: SashDragItemState | undefined;
      let afterItem: SashDragItemState | undefined;

      /* const upIndexes = range(index, -1);
      const downIndexes = range(index + 1, this.viewItems.length);

      const beforeItemIndex = this.findFirstIndex(upIndexes);
      const afterItemIndex = this.findFirstIndex(downIndexes);

      if(typeof beforeItemIndex === 'number') {
        const viewItem = this.viewItems[beforeItemIndex];
        beforeItem = {
          index: beforeItemIndex,
          limitDelta: 0, // not impl
          size: viewItem.view.size
        };
      }

      if(typeof afterItemIndex === 'number') {
        const viewItem = this.viewItems[afterItemIndex];
        afterItem = {
          index: afterItemIndex,
          limitDelta: 0, // not impl
          size: viewItem.view.size
        };
      } */

      this.sashDragState = { start, current: start, index, sizes, minDelta, maxDelta, beforeItem, afterItem };
    };

    resetSashDragState(start);
  }

  onSashChange({ current }: MappedSashEvent): void {
    // console.log('onSashChange event is called.., current =', current);
    const { index, start, sizes, beforeItem, afterItem } = this.sashDragState;
    // console.log('this.sashDragState =', this.sashDragState);
    this.sashDragState.current = current;
    const delta = current - start;

    // console.log('before sizes =', this.viewItems.map(item => item.view.size));
    const newDelta = this.resize(index, delta, sizes, beforeItem, afterItem);
    // console.log('after sizes =', this.viewItems.map(item => item.view.size));
    this.layoutViews();
  }

  resize(index: number,
    delta: number,
    sizes = this.viewItems.map(item => item.view.size),
    beforeItem: SashDragItemState,
    afterItem: SashDragItemState
  ): number {
    if(index < 0 || index >= this.viewItems.length)
      return 0;

    const upIndexes = range(index, -1);
    const downIndexes = range(index + 1, this.viewItems.length);

    const upItems = upIndexes.map(i => this.viewItems[i]);
    const upSizes = upIndexes.map(i => sizes[i]);

    const downItems = downIndexes.map(i => this.viewItems[i]);
    const downSizes = downIndexes.map(i => sizes[i]);

    /* if(beforeItem) {
      const v = this.viewItems[beforeItem.index];
      v.view.size = beforeItem.size;
    }

    if(afterItem) {
      const v = this.viewItems[afterItem.index];
      v.view.size = afterItem.size;
    } */

    upItems[0].view.size = upSizes[0] + delta;
    downItems[0].view.size = downSizes[0] - delta;

    /* for(let i = 0, deltaUp = delta; i < upItems.length; i++) {
      const item = upItems[i];
      const size = upSizes[i] + deltaUp;
      const viewDelta = size - upSizes[i];

      deltaUp -= viewDelta;
      item.view.size = size;
    }

    for(let i = 0, deltaDown = delta; i < downItems.length; i++) {
      const item = downItems[i];
      const size = downSizes[i] - deltaDown;
      const viewDelta = size - downSizes[i];

      deltaDown += viewDelta;
      item.view.size = size;
    } */

    return delta;
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

    // Layout sashes
    this.sashItems.forEach(item => item.sash.layout());
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