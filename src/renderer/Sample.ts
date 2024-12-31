import { $ } from "./util/dom";

export interface SampleOptions {}

export class Sample {
  
  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.sample');
    return el;
  }

}