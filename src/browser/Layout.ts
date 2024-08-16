import { Disposable } from '../base/common/Lifecycle';

export abstract class Layout extends Disposable {

  readonly mainContainer = document.createElement('div');

  constructor(
    protected readonly parent: HTMLElement
  ) {
    super();
  }
  
}