import * as dom from '../../../base/browser/dom';
import { Composite } from "../Composite";

export class BookmarkComposite extends Composite {
  static ID: string = 'composite.bookmark';

  container: HTMLElement;

  constructor() {
    super(BookmarkComposite.ID);
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.container = dom.append(parent, dom.$('.bookmark-composite'));
  }
}