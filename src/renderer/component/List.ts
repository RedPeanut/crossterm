import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { BodyLayoutService } from "../layout/BodyLayout";
import { SessionPartService } from "../part/SessionPart";
import { bodyLayoutServiceId, bookmarkPanelServiceId, sessionPartServiceId, getService, } from "../Service";
import { $, append } from "../util/dom";
import { findActiveItem } from "../utils";
import { v4 as uuidv4 } from 'uuid';

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export type FolderModeType = 0 | 1 | 2; // 0: 기본값; 1: 단일 선택 2: 다중 선택

export interface ListItemElem {
  type?: ListItemType;
  title?: string;
  id: string;
  children?: ListItemElem[];

  // remote
  url?: { host: string, port: number, username: string, password: string };
  size?: { row: number, col: number }

  // control
  canSelect?: boolean; // 선택 가능 여부, 기본값은 true
  canDrag?: boolean; // 드래그 가능 여부, 기본값은 true
  canDropBefore?: boolean; // 이전 드롭이 허용되는지 여부, 기본값은 true
  canDropIn?: boolean; // 드롭인 허용 여부, 기본값은 true
  canDropAfter?: boolean; // 이후 드롭을 허용할지 여부, 기본값은 true
  isCollapsed?: boolean;
}

export class List {
  container: HTMLElement;
  element: HTMLElement;
  // showList: ListItem[];
  state: {
    selectedIds: string[],
    showList: ListItemElem[],
  };

  tree: Tree;

  constructor(container: HTMLElement) {
    this.container = container;
    this.state = {
      selectedIds: [],
      showList: [
        {
          type: 'folder',
          title: 'folder',
          id: '52528ee3-aa4f-44a5-b763-5cf69acacf51',
          children: [
            {
              id: 'e54af9c1-f003-4b1b-8db4-e796f69a9a4d',
              title: 'xyz',
              type: 'remote',
              url: {
                host: '192.168.0.25',
                port: 22,
                username: 'kimjk',
                password: '1234',
              },
              size: { row: 24, col: 80 }
            },
            {
              type: 'local',
              title: 'local',
              id: '96367ed9-6fb1-434b-b45d-de9d2d21898a',
            }
          ],
          // isCollapsed: false
        },
        {
          type: 'remote',
          title: 'remote',
          // url: 'www.remote.com',
          id: '8d65f5a3-306d-44c7-a43f-b5abc17b6a2b',
          url: {
            host: '192.168.200.104',
            port: 22,
            username: 'kimjk',
            password: '1234',
            // password: '1111',
          },
          size: { row: 24, col: 80 }
        },
        /* {
          type: 'group',
          title: 'group',
          id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
        }, */
        {
          type: 'local',
          title: 'local',
          id: '751b26d0-5c94-4328-a0e8-23fdd85d160f',
          size: { row: 24, col: 80 },
        }
      ]
    };
  }

  flatten(list: ListItemElem[]): ListItemElem[] {
    let new_list: ListItemElem[] = [];
    list.map((item) => {
      new_list.push(item);
      if(item.children) {
        new_list = [...new_list, ...this.flatten(item.children)];
      }
    });
    return new_list;
  }

  onDoubleClick(id: string): void {
    // console.log('onDoubleClick() is called..., id =', id);
    const { showList } = this.state;
    const item: ListItemElem | undefined = this.flatten(showList).find((item) => item.id === id);

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
  }

  create(): void {
    this.element = $('.list');
    const tree = this.tree = new Tree(this.element);
    tree.create(
      this.state.showList, // tree: ListItemElem[]
      this.state.selectedIds, // selectedIds: string[]
      (list: any) => {
        this.state = {
          ...this.state,
          showList: list
        };
      }, // onChange: (list: ListItemElem[]) => void
      (ids: string[]) => {
        this.state = {
          ...this.state,
          selectedIds: ids || ['0']
        };
      }, // onSelect: (ids: string[]) => void
      (data: ListItemElem) => {
        const listItem = new ListItem(null);
        return listItem.create(data);
      }, // nodeRender: (data: ListItemElem) => HTMLElement | null
      this.onDoubleClick.bind(this) // (id: string) => void
    );
    append(this.container, this.element);
  }
}

export class ListItem {
  container: HTMLElement;
  element: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  create(data: ListItemElem): HTMLElement {
    this.element = $('.list-item');

    const title = $('.title');
    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' :
      data.type === 'local' ? 'note' /* 'package' */ :
      data.type === 'remote' ? 'globe' : data.type;
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    append(span, itemIcon);
    // console.log(span.outerHTML);
    // append(title, span);
    title.innerHTML = span.outerHTML + data.title;
    append(this.element, title);

    // append(this.container, this.element);
    return this.element;
  }
}

export class Tree {
  container: HTMLElement;
  element: HTMLElement;
  // tree: ListItemElem[];
  onSelect: (id: string[]) => void;
  onDoubleClick: (id: string) => void;
  nodes: Node[];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  onSelect_(id: string): void {
    const onSelect = this.onSelect;
    let new_selected_ids: string[] = [];
    new_selected_ids = [id];
    onSelect && onSelect(new_selected_ids);
  }

  onDoubleClick_(id: string): void {
    // console.log('onDoubleClick_() is called...');
    this.onDoubleClick && this.onDoubleClick(id);
  }

  create(tree: ListItemElem[],
    selectedIds: string[],
    onChange: Function,
    onSelect: (id: string[]) => void,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
    onDoubleClick: (id: string) => void
  ): void {
    // this.tree = tree;
    this.onSelect = onSelect;
    this.onDoubleClick = onDoubleClick;

    this.element = $('.tree');
    this.nodes = [];
    tree.map((e) => {
      const node = new Node(this.element);
      node.create(e, 0, nodeRender, this.onSelect_.bind(this), this.onDoubleClick_.bind(this), selectedIds);
      this.nodes.push(node);
    });
    append(this.container, this.element);
  }
}

export class Node {
  container: HTMLElement;

  element: HTMLElement;
  node: HTMLElement;
  children: Node[];
  id: string;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  create(
    data: ListItemElem,
    level: number = 0,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
    onSelect: (id: string) => void,
    onDoubleClick: (id: string) => void,
    selectedIds
  ): void {
    this.id = data.id;

    const isSelected = selectedIds.includes(data.id);
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;
    const isCollapsed = data.isCollapsed == null || data.isCollapsed == undefined
      ? true : data.isCollapsed;

    const wrapper = this.element = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${level * 20 + 4}px`;

    node.onclick = (e) => {
      onSelect(data.id);
      const bookmarkPanelService = getService(bookmarkPanelServiceId);
      bookmarkPanelService.onSelect(data.id);
    };
    node.ondblclick = (e) => onDoubleClick(data.id);

    const content = $('.content');
    const header = $('.ln-header');
    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) wrapper.classList.add('collapsed');
      arrow.onclick = (e) => {
        // onChange(data.id, { isCollapsed: !isCollapsed });
        wrapper.classList.toggle('collapsed');
      };

      const collapseArrow = $('a.codicon.codicon-chevron-right');
      if(collapseArrow)
        arrow.appendChild(collapseArrow);
      else
        arrow.innerHTML = '>';

      header.append(arrow);
    }
    content.append(header);

    const body = $('.ln-body');
    const listItem = nodeRender ? nodeRender(data) : data.title || `node#${data.id}`;
    body.append(listItem);
    content.append(body);

    append(node, content);
    append(wrapper, node);

    if(hasChildren) {
      this.children = [];
      data.children.map((e) => {
        const _node = new Node(wrapper);
        _node.create(e, level+1, nodeRender, onSelect, onDoubleClick, selectedIds);
        this.children.push(_node);
      });
    }

    append(this.container, wrapper);
  }
}