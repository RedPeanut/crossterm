import { renderer } from "..";
import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { List, ListItemElem } from "../component/List";
import { BodyLayoutService } from "../layout/BodyLayout";
import { Pane, PaneOptions } from "../Pane";
import { SessionPartService } from "../part/SessionPart";
import { getService, bodyLayoutServiceId, sessionPartServiceId } from "../Service";
import { $ } from "../util/dom";
import { findActiveItem } from "../utils";
import * as utils from "../utils";
import { v4 as uuidv4 } from 'uuid';

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
      { title: 'New Session...', icon: 'new-file', click: () => {} },
      { title: 'New Folder...', icon: 'new-folder', click: () => {} },
      { title: 'Collapse Folders in Sessions', icon: 'collapse-all', click: () => {} }
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
    const list = this.list = new List(this.body,
      renderer.list, // list: ListItemElem[]
      (e: MouseEvent, id: string) => {}, // onClick
      (e: MouseEvent, id: string) => {
        // const list = renderer.list;
        const item: ListItemElem | undefined = utils.flatten(renderer.list).find((item) => item.id === id);

        const new_one: TerminalItem = {
          // type: item?.type, size: { row: 24, col: 80 },
          type: item.type, size: item.size, url: item.url,
          uid: uuidv4(), selected: true, active: true,
        };

        // find active item position first
        const find_active = findActiveItem(wrapper.tree, 0, []);
        // console.log('find_active =', find_active);

        // let new_tree;
        if(find_active) {
          const { depth, index, pos, item: activeItem, group: activeGroup, splitItem } = find_active;

          // turn off active item
          activeItem.selected = false;
          activeItem.active = false;

          // attach backward
          activeGroup.push(new_one);
        } else {
          wrapper.tree.list = [ [new_one] ];
        }

        const bodyLayoutService: BodyLayoutService = getService(bodyLayoutServiceId);
        bodyLayoutService.recreate();
        bodyLayoutService.layout(0, 0);

        const sessionPartService: SessionPartService = getService(sessionPartServiceId);
        sessionPartService.getServices();
        sessionPartService.createTerminal();
      } // onDblClick
    );
    list.create();
  }

}