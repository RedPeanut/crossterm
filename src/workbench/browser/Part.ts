import { Component } from "../common/Component";

export interface IPartOptions {}

class PartLayout {
  constructor(private options: IPartOptions, private contentArea: HTMLElement | undefined) { }
}

export abstract class Part extends Component {

  private parent: HTMLElement | undefined;
  private headerArea: HTMLElement | undefined;
  private titleArea: HTMLElement | undefined;
  private contentArea: HTMLElement | undefined;
  private footerArea: HTMLElement | undefined;
  private partLayout: PartLayout | undefined;

  constructor(id: string, private options: IPartOptions) {
    super(id);
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