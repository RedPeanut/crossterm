import { Orientation } from "./component/Sash";
import { SplitView } from "./component/SplitView";
import { Pane } from "./Pane";
import { $, append } from "./util/dom";

interface PaneViewOptions {
  id: string;
  orientation?: Orientation;
}

export abstract class PaneView {

  element: HTMLElement;
  splitView: SplitView<Pane>;
  size: number = 0;
  orientation: Orientation;
  id: string;

  constructor(options: PaneViewOptions) {
    this.id = options.id;
    this.orientation = options.orientation || Orientation.VERTICAL;
  }

  create(): void {
    this.element = $('.pane-view');
    this.splitView = new SplitView<Pane>(this.element, { orientation: this.orientation });
  }

  // getId() { return this.id; }
  addPane(pane: Pane): void { // , index = this.splitView.length): void {
    this.splitView.addView(pane); // , size, index);
  }

  removePane(pane: Pane): void {}

  layout(width: number, height: number): void {
    this.size = this.orientation === Orientation.HORIZONTAL ? width : height;
    this.splitView.layout(this.size);
  }

}