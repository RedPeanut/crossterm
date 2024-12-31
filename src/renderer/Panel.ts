import { Component } from "./Component";

export abstract class Panel extends Component {
  
  parent: HTMLElement | undefined;
  visible = false;

  constructor(id: string) {
    super(id);
  }

  create(parent: HTMLElement) {
    this.parent = parent;
  }

  setVisible(visible: boolean): void {
    if(this.visible !== !!visible) {
      this.visible = visible;
    }
  }
}