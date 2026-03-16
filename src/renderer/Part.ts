import { MappedSashEvent, SplitViewItem, SplitViewItemSizeType, SplitViewItemView } from "./component/SplitView";
import { Component } from "./Component";

export interface PartOptions {
  // sizeType?: SplitViewItemSizeType;
}

export abstract class Part {

  parent: HTMLElement | undefined;
  headerArea: HTMLElement | undefined;
  titleArea: HTMLElement | undefined;
  contentArea: HTMLElement | undefined;
  footerArea: HTMLElement | undefined;

  // options: object;

  constructor(parent: HTMLElement, options: PartOptions) {
    this.parent = parent;
    // this.options = options;
    if(options) {
      // this._sizeType = options.sizeType;
    }
  }

  getContentArea(): HTMLElement | undefined {
    return this.contentArea;
  }

  create(): void {
    this.titleArea = this.createTitleArea();
    this.contentArea = this.createContentArea();
    // this.titleArea && this.parent && this.parent.appendChild(this.titleArea);
    // this.contentArea && this.parent && this.parent.appendChild(this.contentArea);
  }

  createTitleArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', 'content-area', ...this.classes);
    part.id = this.getId();
    part.setAttribute('role', this.role);
    return part;
  }

  // abstract toJSON(): object;
}