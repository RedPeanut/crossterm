import { Parts } from './Workbench';
import { Disposable, IDisposable } from '../../base/common/Lifecycle';
import { Part } from './Part';

export abstract class Layout extends Disposable {

  readonly mainContainer = document.createElement('div');
  private readonly parts = new Map<string, Part>();
  
  constructor(
    protected readonly parent: HTMLElement
  ) {
    super();
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