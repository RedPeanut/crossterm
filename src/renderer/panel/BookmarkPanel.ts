import { List } from '../component/List';
import { Node } from '../component/Node';
import * as dom from '../util/dom';
import { Panel } from "../Panel";
import { bookmarkPanelServiceId, setService } from '../Service';

export interface BookmarkPanelService {
  onSelect: (id: string) => void;
}

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

  flatten(list: Node[]): Node[] {
    let new_list: Node[] = [];
    list.map((item) => {
      new_list.push(item);
      if(item.children) {
        new_list = [...new_list, ...this.flatten(item.children)];
      }
    });
    return new_list;
  }

  onSelect(id: string) {
    this.flatten(this.list.tree.nodes).map((node, index) => {
      if(node.id === id)
        node.node.classList.add('selected');
      else
        node.node.classList.remove('selected');
    });
  };
}