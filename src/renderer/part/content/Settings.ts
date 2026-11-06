import { $ } from "../../util/dom";

export interface SettingsOptions {}

export class Settings {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.settings');
    return el;
  }

}