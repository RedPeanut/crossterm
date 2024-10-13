import * as dom from '../../../base/browser/dom';
import { Composite } from "../Composite";

export class SampleComposite extends Composite {
  static ID: string = 'composite.sample';

  container: HTMLElement;

  constructor() {
    super(SampleComposite.ID);
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.container = dom.append(parent, dom.$('.sample-composite'));
  }
}