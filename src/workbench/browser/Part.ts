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

  role: string;
  classes: string[];
  options: object;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(id);
    this.parent = parent;
    this.role = role;
    this.classes = classes;
    this.options = options;
  }

  create(): void {
    this.titleArea = this.createTitleArea();
    this.contentArea = this.createContentArea();
    // this.partLayout = new PartLayout(this.options, this.contentArea);
  }

  createTitleArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  createContentArea(): HTMLElement {
    // Method not implemented yet
    return null;
  }

  // abstract toJSON(): object;
}