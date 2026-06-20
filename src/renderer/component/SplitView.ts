import { EventEmitter } from 'events';
import { append, $ } from '../util/dom';
import { Orientation, Sash, SashEvent, SashState } from './Sash';
import { range } from '../util/arrays';
import { clamp } from '../../common/util/numbers';
import { Pane } from '../Pane';
import { Disposable, _on_e } from '../util/lifecycle';

export interface MappedSashEvent {
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
  set element(e: HTMLElement);
  get size(): number;
  set size(n: number);
  get sizeType(): SplitViewItemSizeType;
  set sizeType(ty: SplitViewItemSizeType);
  get minimumSize(): number;
  set minimumSize(n: number);
  get maximumSize(): number;
  set maximumSize(n: number);
  get border(): boolean;
  set border(b: boolean);
  get sashEnablement(): boolean;
  set sashEnablement(b: boolean);

  layout(offset: number, size: number): void;
  onDidChange(mappedEvent: MappedSashEvent): void;
  doWhenVisible(visible: boolean): void;

  readonly preferredWidth?: number;
  readonly preferredHeight?: number;
}

export abstract class SplitViewItem<T extends SplitViewItemView> {

  _cachedVisibleSize: number | undefined = undefined;
  get cachedVisibleSize(): number | undefined { return this._cachedVisibleSize; }
  set cachedVisibleSize(sz: number | undefined) { this._cachedVisibleSize = sz; }

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

    this.view.doWhenVisible(visible);
  }

  get minimumSize(): number { return this.visible ? this.view.minimumSize : 0; }
  get maximumSize(): number { return this.visible ? this.view.maximumSize : 0; }

  get viewMinimumSize(): number { return this.view.minimumSize; }
  get viewMaximumSize(): number { return this.view.maximumSize; }

  _cachedSize: number | undefined = undefined;
  get cachedSize(): number | undefined { return this._cachedSize; }
  set cachedSize(sz: number | undefined) { this._cachedSize = sz; }

  set size(sz: number) {
    this.cachedSize = this.view.size;
    this.view.size = sz;
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

export interface SplitViewItemDescriptor<T extends SplitViewItemView> {
  size: number;
  views: {
    visible?: boolean;
    size: number;
    view: T;
  }[];
}

export interface SplitViewOptions<T extends SplitViewItemView> {
  orientation?: Orientation;
  descriptor?: SplitViewItemDescriptor<T>;
}

export class SplitView<T extends SplitViewItemView> extends Disposable {

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

  constructor(container: HTMLElement, options: SplitViewOptions<T>) {
    super();
    this.container = container;
    this.orientation = options.orientation != null ? options.orientation : Orientation.VERTICAL;
    // this.viewItems = [];

    this.el = document.createElement('div');
    this.el.classList.add('split-view');
    this.el.classList.add(this.orientation === Orientation.VERTICAL ? 'vertical' : 'horizontal');
    this.sashContainer = append(this.el, $('.sash-container'));
    this.viewContainer = append(this.el, $('.split-view-container'));
    this.container.appendChild(this.el);

    if(options.descriptor) {
      this.size = options.descriptor.size;
      for(let i = 0; i < options.descriptor.views.length; i++) {
        const viewDescriptor = options.descriptor.views[i];
        const view = viewDescriptor.view;
        const size = viewDescriptor.size;
        console.log(`${i} ${{...view}} ${size}`);
        this.addView(view, i);
      }
      /* options.descriptor.views.forEach((viewDescriptor, index) => {
        const view = viewDescriptor.view;
        const size = viewDescriptor.size;
        console.log(`${index} ${{...view}} ${size}`);
        this.addView(view, index);
      }); */
    }
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
        container.classList.add('visible');

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
    container.classList.add('visible');

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

      this._register(_on_e(sash, 'sash start', (e) => {
        // console.log('sash start event is called.. e =', e);
        const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
        this.onSashStart(mappedEvent);
      }));
      this._register(_on_e(sash, 'sash change', (e) => {
        // console.log('sash change event is called.. e =', e);
        const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
        this.onSashChange(mappedEvent);
      }));
      this._register(_on_e(sash, 'sash end', (e) => {
        // console.log('sash end event is called..'); // e =', e);
        const mappedEvent = sashEventMapper(e);
        // console.log('mappedEvent =', mappedEvent);
        view.onDidChange(mappedEvent);
      }));

      this._register(_on_e(sash, 'sash reset', (e) => {
        // console.log('sash reset is called ..');
        const index = this.sashItems.findIndex(item => item.sash === sash);

        // if view is fill_parent, control size with next wrap_content view
        // (fill_parent is only one in line)
        if(this.viewItems[index].view.sizeType == 'fill_parent') {
          // const nextView = this.viewItems[index+1].view;
          let preferredSize = this.orientation == Orientation.HORIZONTAL ? this.viewItems[index+1].view.preferredWidth :this.viewItems[index+1].view.preferredHeight;
          preferredSize = clamp(preferredSize, this.viewItems[index+1].view.minimumSize, this.viewItems[index+1].view.maximumSize);
          const delta = preferredSize - this.viewItems[index+1].view.size;
          // console.log('preferredSize =', preferredSize);
          // console.log('delta =', delta);
          this.viewItems[index+1].view.size = preferredSize;
          this.viewItems[index].view.size = this.viewItems[index].view.size - delta;
          this.layoutViews();
        } else {
          let preferredSize = this.orientation == Orientation.HORIZONTAL ? this.viewItems[index].view.preferredWidth :this.viewItems[index].view.preferredHeight;
          preferredSize = clamp(preferredSize, this.viewItems[index].view.minimumSize, this.viewItems[index].view.maximumSize);
          const delta = preferredSize - this.viewItems[index].view.size;
          // console.log('preferredSize =', preferredSize);
          // console.log('delta =', delta);
          this.viewItems[index].view.size = preferredSize;
          this.viewItems[index+1].view.size = this.viewItems[index+1].view.size - delta;
          this.layoutViews();
        }
      }));

      const sashItem: SashItem = { sash };
      this.sashItems.splice(index-1, 0, sashItem);
    }

    // append
    container.appendChild(view.element);
  }

  findFirstIndex(indexes: number[]): number | undefined {
    for(const index of indexes) {
      const viewItem = this.viewItems[index];
      return index;
    }
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

      const upIndexes = range(index, -1);
      const downIndexes = range(index + 1, this.viewItems.length);

      const minDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].minimumSize - sizes[i]), 0);
      // const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].viewMaximumSize), 0);
      // const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].viewMaximumSize - sizes[i]), 0);
      const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].minimumSize), 0);

      // minDelta = Math.max(minDeltaUp, minDeltaDown);
      // maxDelta = Math.min(maxDeltaUp, maxDeltaDown);
      minDelta = Math.max(minDeltaUp);
      maxDelta = Math.min(maxDeltaDown);

      console.log('minDeltaUp =', minDeltaUp);
      // console.log('minDeltaDown =', minDeltaDown);
      console.log('maxDeltaDown =', maxDeltaDown);
      console.log('minDelta =', minDelta);
      // console.log('maxDelta =', maxDelta);

      let beforeItem: SashDragItemState | undefined;
      let afterItem: SashDragItemState | undefined;

      const beforeItemIndex = this.findFirstIndex(upIndexes);
      const afterItemIndex = this.findFirstIndex(downIndexes);

      if(typeof beforeItemIndex === 'number') {
        const viewItem = this.viewItems[beforeItemIndex];
        const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
        // console.log('halfSize =', halfSize);

        beforeItem = {
          index: beforeItemIndex,
          limitDelta: viewItem.visible ? minDelta - halfSize : minDelta + halfSize,
          size: viewItem.view.size
        };
        // console.log('beforeItem =', beforeItem);
      }

      if(typeof afterItemIndex === 'number') {
        const viewItem = this.viewItems[afterItemIndex];
        afterItem = {
          index: afterItemIndex,
          limitDelta: 0, // not impl
          size: viewItem.view.size
        };
      }

      this.sashDragState = { start, current: start, index, sizes, minDelta, maxDelta, beforeItem, afterItem };
    };

    resetSashDragState(start);
  }

  onSashChange({ current }: MappedSashEvent): void {
    // console.log('onSashChange event is called.., current =', current);
    const { index, start, sizes, minDelta, maxDelta, beforeItem, afterItem } = this.sashDragState;
    // console.log('this.sashDragState =', this.sashDragState);
    this.sashDragState.current = current;
    const delta = current - start;

    // console.log('before sizes =', this.viewItems.map(item => item.view.size));
    const newDelta = this.resize(index, delta, sizes, minDelta, maxDelta, beforeItem, afterItem);
    // console.log('after sizes =', this.viewItems.map(item => item.view.size));
    this.distributeEmptySpace();
    this.layoutViews();
  }

  resize(index: number,
    delta: number,
    sizes = this.viewItems.map(item => item.view.size),
    minDelta: number = Number.NEGATIVE_INFINITY,
    maxDelta: number = Number.POSITIVE_INFINITY,
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

    const minDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].minimumSize - sizes[i]), 0);
    const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].maximumSize), 0);
    const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].maximumSize - sizes[i]), 0);
    const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].minimumSize), 0);

    let snapped = false;

    if(beforeItem) {
      const snapView = this.viewItems[beforeItem.index];
      const visible = delta >= beforeItem.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible); //, beforeItem.size);
    }

    /* if(!snapped && afterItem) {
      const snapView = this.viewItems[afterItem.index];
      const visible = delta < afterItem.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible); //, snapAfter.size);
    } */

    if(snapped)
      return -1;

    delta = clamp(delta, minDelta, maxDelta);

    upItems[0].view.size = clamp(upSizes[0] + delta, upItems[0].minimumSize, upItems[0].maximumSize);
    downItems[0].view.size = clamp(downSizes[0] - delta, downItems[0].minimumSize, downItems[0].maximumSize);

    return delta;
  }

  distributeEmptySpace(): void {
    const contentSize = this.viewItems.reduce((r, i) => r + i.view.size + (i.view.border ? 1 : 0), 0);
    let emptyDelta = this.size - contentSize;
    console.log(`${emptyDelta} = ${this.size} - ${contentSize}`);

    const indexes = range(this.viewItems.length - 1, -1);

    for (let i = 0; emptyDelta > 0 && i < indexes.length; i++) {
      const item = this.viewItems[indexes[i]];
      const size = clamp(item.view.size + (item.view.border ? 1 : 0) + emptyDelta, item.minimumSize, item.maximumSize);
      const viewDelta = size - item.view.size - (item.view.border ? 1 : 0);

      emptyDelta -= viewDelta;
      item.view.size = size;
    }
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
    // console.log('layout() is called .., totalSize =', totalSize);
    this.size = totalSize;

    if(this.proportions) {
      let total = 0;
      for(let i = 0; i < this.viewItems.length; i++) {
        const viewItem = this.viewItems[i];
        viewItem.view.size = totalSize * this.proportions[i];
      }
      this.layoutViews();
    } else {
      let total = 0;
      for(let i = 0; i < this.viewItems.length; i++) {
        const viewItem = this.viewItems[i];
        if(viewItem.view.sizeType === 'wrap_content') {
          let itemSize = (viewItem.view.border ? 1 : 0) + viewItem.view.size;
          total += itemSize;
          totalSize -= itemSize;
        }
      }

      // fill empty space (dangling implementation)
      for(let i = 0; i < this.viewItems.length; i++) {
        const viewItem = this.viewItems[i];
        if(viewItem.view.sizeType === 'fill_parent') {
          viewItem.view.size = totalSize - (viewItem.view.border ? 1 : 0);
        }
      }

      this.layoutViews();
    }
  }

  layoutViews(): void {
    let offset = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const viewItem = this.viewItems[i];
      viewItem.layoutContainer((viewItem.view.border ? 1 : 0) + offset);
      // console.log(`[${i}] ${item.size}`);
      offset += (viewItem.view.border ? 1 : 0) + viewItem.view.size;
    }

    // Layout sashes
    this.sashItems.forEach(sashItem => sashItem.sash.layout());
    this.updateSashEnablement();
  }

  updateSashEnablement(): void {
    for(let i = 0; i < this.viewItems.length; i++) {
      if(i > 0) {
        // const viewItem = this.viewItems[i];
        const sashState: SashState = this.viewItems[i].view.sashEnablement ? SashState.Enabled : SashState.Disabled;
        // if(sashState != this.sashItems[i-1].sash.state) {
          this.sashItems[i-1].sash.state = sashState;
        // }
      }
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

  layout_pane(width: number, height: number) {
    let totalSize = this.size = this.orientation === Orientation.HORIZONTAL ? width : height;
    // this.splitView.layout(this.size);

    let total = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const viewItem = this.viewItems[i];
      if(viewItem.view instanceof Pane) {
        // const view = viewItem.view as Pane;

        // set with cache when wrap_content
        if(viewItem.view.sizeType === 'wrap_content') {
          let itemSize: number, border: number = viewItem.view.border ? 1 : 0;
          if(viewItem.view.expanded) {
            if(viewItem.cachedSize != undefined) {
              itemSize = viewItem.cachedSize; // get itemSize

              viewItem.cachedSize = undefined; // clear cache
              viewItem.view.size = itemSize; // restore set
            } else {
              itemSize = border + viewItem.view.size; // get itemSize
              if(viewItem.view.size != border + viewItem.view.headerSize)
                viewItem.size = itemSize; // set with cache
            }
          } else {
            itemSize = border + viewItem.view.headerSize;
            if(viewItem.view.size != border + viewItem.view.headerSize)
              viewItem.size = itemSize; // set with cache
          }
          total += itemSize;
          totalSize -= itemSize;
        }
      }
    }

    // fill empty space (dangling implementation)
    for(let i = 0; i < this.viewItems.length; i++) {
      const viewItem = this.viewItems[i];
      if(viewItem.view instanceof Pane) {
        // const view = viewItem.view as Pane;

        // cache is not required when fill_parent (fixed value set)
        if(viewItem.view.sizeType === 'fill_parent') {
          let border: number = viewItem.view.border ? 1 : 0;
          if(viewItem.view.expanded) {
            viewItem.view.size = totalSize - border;
          } else {
            viewItem.view.size = viewItem.view.headerSize - border;
          }
        }
      }
    }

    this.layoutViews();
  }

  /* layoutViews_pane(): void {
    let offset = 0;
    for(let i = 0; i < this.viewItems.length; i++) {
      const viewItem = this.viewItems[i];

      if(viewItem.view instanceof Pane) {
        // const view = viewItem.view as Pane;
        const border = viewItem.view.border ? 1 : 0;
        viewItem.layoutContainer(border + offset);

        // view.size = view.expanded ? view.size : Pane.HEADER_SIZE;
        // console.log(`[${i}] ${item.size}`);
        offset += border + viewItem.view.size;
      }
    }

    // Layout sashes
    this.sashItems.forEach(sashItem => sashItem.sash.layout());
    this.updateSashEnablement();
  } */
}