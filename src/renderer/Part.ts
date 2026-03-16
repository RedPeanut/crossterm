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
  element: HTMLElement;

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
  }

  createTitleArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(): HTMLElement {
    this.element = this.parent;
    return this.element;
  }

  // abstract toJSON(): object;
}