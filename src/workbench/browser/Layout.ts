import { Parts } from './Workbench';
import { Disposable, IDisposable } from '../../base/common/Lifecycle';
import { Part } from './Part';

export abstract class Layout extends Disposable {

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

  protected getPart(key: Parts): Part {
    const part = this.parts.get(key);
    if (!part) {
      throw new Error(`Unknown part ${key}`);
    }
    return part;
  }
}