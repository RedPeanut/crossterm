import { Parts } from './layout/Workbench';
import { Disposable, IDisposable } from '../../base/common/Lifecycle';
import { Part } from './Part';
import { SplitViewItem, SplitViewItemSizeType } from '../../base/browser/ui/SplitView';

export abstract class Layout extends Disposable implements SplitViewItem {

  set size(size: number) {
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

  parent: HTMLElement;
  mainContainer = document.createElement('div');
  parts = new Map<string, Part>();

  constructor(parent: HTMLElement) {
    super();
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