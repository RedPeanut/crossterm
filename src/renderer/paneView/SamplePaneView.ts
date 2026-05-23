import { PaneView } from "../PaneView";
import { SamplePane } from "../pane/SamplePane";

export class SamplePaneView extends PaneView {
  static ID = 'pane-view.sample';

  constructor() {
    super({ id: SamplePaneView.ID });
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.element.classList.add('sample');

    const samplePane = new SamplePane(null, {});
    samplePane.render();
    this.addPane(samplePane);
  }
}