import { renderer } from "..";
import { ListPane } from "../pane/ListPane";
import { DetailPane } from "../pane/DetailPane";
import { PaneView } from "../PaneView";

export class BookmarkPaneView extends PaneView {
  static ID = 'pane-view.bookmark';

  constructor() {
    super({ id: BookmarkPaneView.ID });
  }

  override create(parent: HTMLElement): void {
    super.create(parent);
    this.element.classList.add('bookmark');

    const initialValue = renderer.initial_value.paneview.find((v) => v.name == 'bookmark');
    enum IDX { LIST, DETAIL };

    const bookmarkPane = new ListPane(null, {
      collapsed: initialValue.collapsed[IDX.LIST],
      sizeType: initialValue.sizeType[IDX.LIST],
      size: initialValue.size[IDX.LIST],
      // preferredWidth: initialValue.preferredWidth[IDX.LIST],
      preferredHeight: initialValue.preferredHeight[IDX.LIST],
    });
    bookmarkPane.render();
    this.addPane(bookmarkPane);

    const descPane = new DetailPane(null, {
      collapsed: initialValue.collapsed[IDX.DETAIL],
      sizeType: initialValue.sizeType[IDX.DETAIL],
      size: initialValue.size[IDX.DETAIL],
      // preferredWidth: initialValue.preferredWidth[IDX.DETAIL],
      preferredHeight: initialValue.preferredHeight[IDX.DETAIL],
    });
    descPane.render();
    this.addPane(descPane);
  }
}