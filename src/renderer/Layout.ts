import { Part } from './Part';
import { Disposable } from '../common/base/lifecycle';

export abstract class Layout extends Disposable {

  parent: HTMLElement;
  container: HTMLElement = document.createElement('div');
  parts = new Map<string, Part>();

  constructor(parent: HTMLElement) {
    super();
    this.parent = parent;
  }

  registerPart(part: Part): void {
    const id = part.container.id; // getId();
    this.parts.set(id, part);
  }

  getPart(id: string): Part {
    const part = this.parts.get(id);
    if (!part) {
      throw new Error(`Unknown part ${id}`);
    }
    return part;
  }
}