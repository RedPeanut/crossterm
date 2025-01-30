import { List } from '../component/List';
import * as dom from '../util/dom';
import { Panel } from "../Panel";
import { bookmarkPanelServiceId, setService } from '../Service';

export interface BookmarkPanelService {}

export class BookmarkPanel extends Panel implements BookmarkPanelService {
  static ID: string = 'panel.bookmark';

  container: HTMLElement;
  list: List;

  constructor() {
    super(BookmarkPanel.ID);
    setService(bookmarkPanelServiceId, this);
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.container = dom.append(parent, dom.$('.bookmark-panel'));
    const list = this.list = new List(this.container);
    list.create();
  }
}