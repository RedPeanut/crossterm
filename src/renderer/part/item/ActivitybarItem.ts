import { $, append } from "../../util/dom";
import { Component } from "../../Component";
import { Panel } from "../../Panel";

export interface ActivitybarItemOptions {}

export interface ActivitybarItem {
  append(onClick: (e: any) => {}, codicon: string): void;
  updateChecked(checked: boolean): void;
  get id(): string;
  get element(): HTMLElement;
}

export class ActivitybarItemImpl implements ActivitybarItem {
  // static ID: string = 'acion-item.xxx';

  _container: HTMLElement;
  _id: string;
  _panel: Panel;
  _element: HTMLElement;
  // checked: boolean = false;

  get id(): string { return this._id; }
  get element(): HTMLElement { return this._element; }

  constructor(container: HTMLElement, id: string, panel: Panel, options: ActivitybarItemOptions = {}) {
    this._container = container;
    this._id = id;
    this._panel = panel;
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

  updateChecked(checked: boolean): void {
    this._element.classList.toggle('checked', checked);
  }

}