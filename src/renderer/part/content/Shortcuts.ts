import { $ } from "../../util/dom";

export interface ShortcutsOptions {}

export class Shortcuts {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.shortcuts');
    return el;
  }

}