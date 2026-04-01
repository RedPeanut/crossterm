import { renderer } from "..";
import { List } from "../component/List";
import { Pane, PaneOptions } from "../Pane";
import { $ } from "../util/dom";

export class BookmarkPane extends Pane {

  list: List;

  constructor(parent: HTMLElement, options: PaneOptions) {
    super(parent, options);
    this.element.classList.add('bookmark');
    this.minimumSize = Pane.HEADER_SIZE;
    this.sizeType = 'fill_parent';
    this.element.addEventListener('mouseenter', (e) => {
      this.element.classList.add('hover');
    });
    this.element.addEventListener('mouseleave', (e) => {
      this.element.classList.remove('hover');
    });
  }

  renderHeader(container: HTMLElement): void {

    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    this.header.appendChild(arrow);

    const title = $('h3.title');
    title.innerHTML = 'LIST';
    this.header.appendChild(title);

    const div = $('div.actions');
    const ul = $('ul');
    const items = [
      { title: 'New Session...', icon: 'new-file' },
      { title: 'New Folder...', icon: 'new-folder' },
      { title: 'Collapse Folders in Sessions', icon: 'collapse-all' }
    ];

    for(let i = 0; i < items.length; i++) {
      let li = $('li');
      let a = $('a');
      a.title = items[i].title;
      a.classList.add('codicon', 'codicon-' + items[i].icon);
      li.appendChild(a);
      ul.appendChild(li);
    }

    div.appendChild(ul);
    this.header.appendChild(div);
  }

  renderBody(container: HTMLElement): void {
    // draw list in body
    const list = this.list = new List(this.body, renderer.list); // model: ListItemElem[], onDblClick, onSelect
    list.create();
  }

}