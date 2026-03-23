import { PaneView } from "../PaneView";

export class SamplePaneView extends PaneView {
  static ID = 'pane-container.sample';

  constructor() {
    super({ id: SamplePaneView.ID });
  }

  override create(): void {}
}