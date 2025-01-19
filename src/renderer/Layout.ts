import { Parts } from './layout/MainLayout';
import { Part } from './Part';
import { SplitViewItem, SplitViewItemSizeType } from './component/SplitView';

export abstract class Layout {

  /* set size(size: number) {
    this._size = size;
  }

  get size(): number {
    return this._size;
  }

  get element(): HTMLElement {
    return this.mainContainer;
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
  set cachedVisibleSize(cachedVisibleSize: number | undefined) { this._cachedVisibleSize = cachedVisibleSize; }
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

  parent: HTMLElement;
  mainContainer = document.createElement('div');
  parts = new Map<string, Part>();

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  registerPart(part: Part): void {
    const id = part.getId();
    this.parts.set(id, part);
  }

  /* getPart(key: Parts): Part {
    const part = this.parts.get(key);
    if (!part) {
      throw new Error(`Unknown part ${key}`);
    }
    return part;
  } */

  getPart(id: string): Part {
    const part = this.parts.get(id);
    if(!part) {
      throw new Error(`Unknown part ${id}`);
    }
    return part;
  }
}