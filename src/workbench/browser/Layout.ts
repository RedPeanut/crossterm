import { Parts } from './Workbench';
import { Disposable, IDisposable } from '../../base/common/Lifecycle';
import { Part } from './Part';
import { Splittable } from '../../base/browser/ui/SplitView';

export abstract class Layout extends Disposable implements Splittable {

  get element(): HTMLElement {
    return this.mainContainer;
  }

  layoutContainer(offset: number): void {
    // not implemented yet
  }

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