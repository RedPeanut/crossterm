import * as dom from '../util/dom';
import { Panel } from "../Panel";

export class SamplePanel extends Panel {
  static ID: string = 'panel.sample';

  container: HTMLElement;

  constructor() {
    super(SamplePanel.ID);
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.container = dom.append(parent, dom.$('.sample-panel'));
  }
}