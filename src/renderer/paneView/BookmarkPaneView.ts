import { BookmarkPane } from "../pane/BookmarkPane";
import { DescPane } from "../pane/DescPane";
import { PaneView } from "../PaneView";

export class BookmarkPaneView extends PaneView {
  static ID = 'pane-view.bookmark';

  constructor() {
    super({ id: BookmarkPaneView.ID });
  }

  override create(): void {
    super.create();
    const bookmarkPane = new BookmarkPane(null, null);
    bookmarkPane.render();
    this.addPane(bookmarkPane);
    const descPane = new DescPane(null, null);
    descPane.render();
    this.addPane(descPane);
  }
}