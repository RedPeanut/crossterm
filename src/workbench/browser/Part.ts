import { Component } from "../common/Component";

export interface IPartOptions {}

class PartLayout {
  constructor(private options: IPartOptions, private contentArea: HTMLElement | undefined) { }
}

export abstract class Part extends Component {

  parent: HTMLElement | undefined;
  headerArea: HTMLElement | undefined;
  titleArea: HTMLElement | undefined;
  contentArea: HTMLElement | undefined;
  footerArea: HTMLElement | undefined;
  partLayout: PartLayout | undefined;
  options: IPartOptions | undefined;

  constructor(id: string, options: IPartOptions) {
    super(id);
    this.options = options;
  }

  create(parent: HTMLElement, options?: object): void {
    this.parent = parent;
    this.titleArea = this.createTitleArea(parent, options);
    this.contentArea = this.createContentArea(parent, options);
    this.partLayout = new PartLayout(this.options, this.contentArea);
  }

  createTitleArea(parent: HTMLElement, options: object): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(parent: HTMLElement, options: object): HTMLElement {
    // Method not implemented yet
    return null;
  }

  // abstract toJSON(): object;
}