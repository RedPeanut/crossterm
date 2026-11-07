import { $ } from "../../util/dom";
import { TabContent } from "./Types";
import { Disposable } from '../../../common/base/lifecycle';

export interface ShortcutsOptions {}

export class Shortcuts extends Disposable implements TabContent {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    super();
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.shortcuts');
    return el;
  }

  fit(): void {}
}