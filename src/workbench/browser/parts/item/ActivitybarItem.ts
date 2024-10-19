import { $, append } from "../../../../base/browser/dom";
import { Component } from "../../../../workbench/common/Component";
import { Composite } from "../../Composite";

export interface ActivitybarItemOptions {}

export interface ActivitybarItem {
  append(onClick: (e: any) => {}, codicon: string): void;
  get id(): string;
  get element(): HTMLElement;
}

export class ActivitybarItemImpl implements ActivitybarItem {
  // static ID: string = 'acion-item.xxx';

  _container: HTMLElement;
  _id: string;
  _composite: Composite;
  _element: HTMLElement;
  // checked: boolean = false;

  get id(): string { return this._id; }
  get element(): HTMLElement { return this._element; }

  constructor(container: HTMLElement, id: string, composite: Composite, options: ActivitybarItemOptions = {}) {
    this._container = container;
    this._id = id;
    this._composite = composite;
  }

  append(onClick: (e: any) => {}, codicon: string): void {
    const li = this._element = document.createElement('li');
      li.classList.add(...'activitybar-item'.split(' '));
      li.addEventListener('click', onClick);
      const a = document.createElement('a');
      a.classList.add(...`codicon codicon-${codicon}`.split(' '));
      li.appendChild(a);
  
      // Badge
      const badge = append(li, $('.badge'));
      const badgeContent = append(badge, $('.badge-content'));
  
      // active indicator
      append(li, $('.active-item-indicator'));
  
      this._container.appendChild(li);
  }

}