import { Parts } from './layout/Workbench';
import { Disposable, IDisposable } from '../../base/common/Lifecycle';
import { Part } from './Part';
import { SplitViewItem } from '../../base/browser/ui/SplitView';

export abstract class Layout extends Disposable implements SplitViewItem {

  setSize(size: number): void {
    this.size = size;
  }

  getSize(): number {
    return this.size;
  }

  getElement(): HTMLElement {
    return this.mainContainer;
  }

  setSplitViewContainer(container: HTMLElement): void {
    this.splitViewContainer = container;
  }

  abstract layoutContainer(offset: number): void;

  size: number = 0;
  splitViewContainer: HTMLElement | undefined;

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
    if (!part) {
      throw new Error(`Unknown part ${id}`);
    }
    return part;
  }
}