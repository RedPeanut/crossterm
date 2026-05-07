import { ListPane } from "../pane/ListPane";
import { DetailPane } from "../pane/DetailPane";
import { PaneView } from "../PaneView";

export class BookmarkPaneView extends PaneView {
  static ID = 'pane-view.bookmark';

  constructor() {
    super({ id: BookmarkPaneView.ID });
  }

  override create(): void {
    super.create();
    const bookmarkPane = new ListPane(null, null);
    bookmarkPane.render();
    this.addPane(bookmarkPane);
    const descPane = new DetailPane(null, null);
    descPane.render();
    this.addPane(descPane);
  }
}