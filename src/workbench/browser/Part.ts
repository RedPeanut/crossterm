import { SplitViewItem } from "../../base/browser/ui/SplitView";
import { Component } from "../common/Component";

export interface IPartOptions {}

class PartLayout {
  constructor(private options: IPartOptions, private contentArea: HTMLElement | undefined) { }
}

export abstract class Part extends Component implements SplitViewItem {

  get element(): HTMLElement {
    return this.contentArea;
  }

  layoutContainer(offset: number): void {
    // not implemented yet
  }

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
    this.titleArea && this.parent.appendChild(this.titleArea);
    this.contentArea && this.parent.appendChild(this.contentArea);
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