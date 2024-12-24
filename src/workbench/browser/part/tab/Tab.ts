import { $ } from "../../../../base/browser/dom";
import { TerminalItem } from "../../../../Types";

export class Tab {
  parent: HTMLElement;
  element: HTMLElement;
  item: TerminalItem;

  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
    this.item = item;
  }
  
  onDragStart(e: any): void {
    // console.log('onDragStart event is called...');
    // console.log('e =', e);
  }
  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {}
  onDragEnd(e: any): void {}
  onDragOver(e: any): void {}
  onDrop(e: any): void {}

  create(): HTMLElement { 
    const el = this.element = $('.tab');
    el.draggable = true;
    el.ondragstart = this.onDragStart;
    el.ondragenter = this.onDragEnter;
    el.ondragleave = this.onDragLeave;
    el.ondragend = this.onDragEnd;
    el.ondragover = this.onDragOver;
    el.ondrop = this.onDrop;

    const tabBorderTopContainer = $('.tab-border-top-container');
    el.appendChild(tabBorderTopContainer);
    const tabActionsContainer = $('.tab-actions');
    el.appendChild(tabActionsContainer);
    const tabBorderBottomContainer = $('.tab-border-bottom-container');
    el.appendChild(tabBorderBottomContainer);
    return el;
  }
}