import { $ } from "../../util/dom";
import { TabContent } from "./Types";
import { Disposable } from '../../../common/base/lifecycle';

export interface SettingsOptions {}

export class Settings extends Disposable implements TabContent {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    super();
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.settings');
    return el;
  }

  fit(): void {}
}