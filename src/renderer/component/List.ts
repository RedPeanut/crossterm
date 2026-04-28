import { renderer } from "..";
import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { BodyLayoutService } from "../layout/BodyLayout";
import { SessionPartService } from "../part/SessionPart";
import { bodyLayoutServiceId, bookmarkPanelServiceId, sessionPartServiceId, getService, } from "../Service";
import { $ } from "../util/dom";
import { findActiveItem, Children } from "../utils";
import * as utils from "../utils";
import { v4 as uuidv4 } from 'uuid';

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export type FolderModeType = 0 | 1 | 2; // 0: 기본값; 1: 단일 선택 2: 다중 선택

export interface ListItemElem extends Children {
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
    list: ListItemElem[],
  };

  onClick: (e: MouseEvent, id: string) => void;
  onDblClick: (e: MouseEvent, id: string) => void;

  // tree: Tree;
  tree: HTMLElement;
  nodes: Node[];

  constructor(container: HTMLElement, list: ListItemElem[],
    onClick: (e: MouseEvent, id: string) => void,
    onDblClick: (e: MouseEvent, id: string) => void
  ) {
    this.container = container;
    this.state = {
      selectedIds: [],
      list: list || []
    };
    this.onClick = onClick;
    this.onDblClick = onDblClick;
  }

  _onClick(e: MouseEvent, id: string): void {
    // console.log('_onClick is called ..');

    const { selectedIds } = this.state;

    const flattened = utils.flatten(this.nodes);
    // const find = flattened.find((v) => v.id === id);
    let i: number, find: Node = null, findIdx: number;
    for(i = 0; i < flattened.length; i++) {
      if(flattened[i].shortenedId == id) {
        find = flattened[i];
        findIdx = i;
        break;
      }
    }

    const cmdOrCtrlKey = renderer.process.platform === 'darwin' ? e.metaKey : e.ctrlKey;
    /* if(cmdOrCtrlKey && e.shiftKey) {
      if(selectedIds.length == 0) return;

    } else */
    if(e.shiftKey) {
      if(selectedIds.length == 0) return;
      const lastSeletedId = selectedIds[selectedIds.length-1];

      let lastIdx: number;
      for(i = 0; i < flattened.length; i++) {
        if(flattened[i].shortenedId == lastSeletedId) {
          // find = flattened[i];
          lastIdx = i;
          break;
        }
      }

      // from ~ to
      let from: number = lastIdx, to: number = findIdx;
      if(from > to) {
        for(i = from-1; i >= to; i--) {
          flattened[i].node.classList.add('selected');
          selectedIds.push(id);
        }
      } else {
        for(i = from+1; i <= to; i++) {
          flattened[i].node.classList.add('selected');
          selectedIds.push(id);
        }
      }

    } else if(cmdOrCtrlKey) {
      const isSelected = selectedIds.includes(id);
      const selectedIdx = selectedIds.findIndex((v) => v == id);

      if(isSelected) {
        find.node.classList.remove('selected');
        selectedIds.splice(selectedIdx, 1);
      } else {
        find.node.classList.add('selected');
        selectedIds.push(id);
      }
    } else {
      for(i = 0; i < flattened.length; i++) {
        flattened[i].node.classList.remove('selected');
      }

      find.node.classList.add('selected');
      // selectedIds = [ id ];
      this.state = {
        ...this.state,
        selectedIds: [ id ]
      };
    }

    this.onClick(e, id);
    e.stopPropagation();
  }

  _onDblClick(e: MouseEvent, id: string): void {
    // console.log('_onDblClick() is called..., id =', id);
    this.onDblClick(e, id);
  }

  _onChange(id: string): void {
    // console.log('_onChange() is called..., id =', id);
  }

  create(): void {
    const list = this.element = $('.list');
    const tree = this.tree = $('.tree');
    this.nodes = [];
    // const list = this.state.showList;
    this.state.list.map((v: ListItemElem, i: number) => {
      const node = new Node(tree, null);
      node.create(v, 0,
        // nodeRender,
        this._onClick.bind(this), this._onDblClick.bind(this), this.state.selectedIds,
        this._onChange.bind(this)
      );
      this.nodes.push(node);
    });

    list.appendChild(tree);
    this.container.appendChild(list);
  }
}

export class Node implements Children {
  container: HTMLElement;
  wrapper: HTMLElement;
  node: HTMLElement;

  parent: Node;
  children: Node[];

  id: string;
  shortenedId: string;
  type: string;
  isCollapsed: boolean = false;

  constructor(container: HTMLElement, parent: Node) {
    this.container = container;
    this.parent = parent;
  }

  create(
    data: ListItemElem,
    level: number = 0,
    // nodeRender: (data: ListItemElem) => HTMLElement | null,
    onClick: (e: MouseEvent, id: string) => void,
    onDblClick: (e: MouseEvent, id: string) => void,
    selectedIds: string[],
    onChange: (id: string, data: {}) => void
  ): void {
    this.id = data.id;
    this.shortenedId = data.id.substring(0, 7);
    this.type = data.type;

    const isSelected = selectedIds.includes(data.id);
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;
    const isCollapsed = this.isCollapsed = data.isCollapsed == null || data.isCollapsed == undefined
      ? true : data.isCollapsed;

    const wrapper = this.wrapper = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${level * 20 + 4}px`;

    node.onclick = (e: MouseEvent) => {
      onClick(e, data.id.substring(0, 7));
      // const bookmarkPanelService = getService(bookmarkPanelServiceId);
      // bookmarkPanelService.onSelect(data.id);
    };
    node.ondblclick = (e: MouseEvent) => onDblClick(e, data.id);

    const content = $('.content');
    const header = $('.ln-header');
    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) wrapper.classList.add('collapsed');
      arrow.onclick = (e: MouseEvent) => {
        const isCollapsed = wrapper.classList.contains('collapsed');
        const toggled = !isCollapsed;

        this.isCollapsed = toggled;
        if(toggled)
          wrapper.classList.add('collapsed');
        else
          wrapper.classList.remove('collapsed');

        onChange(data.id, { isCollapsed: toggled });
        e.stopPropagation();
      };

      const collapseArrow = $('a.codicon.codicon-chevron-right');
      if(collapseArrow)
        arrow.appendChild(collapseArrow);
      else
        arrow.innerHTML = '>';

      header.appendChild(arrow);
    }
    content.appendChild(header);

    const body = $('.ln-body');
    // const listItem = nodeRender ? nodeRender(data) : data.title || `node#${data.id}`;
    // body.append(listItem);

    const listItem = $('.list-item');
    const title = $('.title');
    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' :
      data.type === 'local' ? 'note' /* 'package' */ :
      data.type === 'remote' ? 'globe' : data.type;
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    span.appendChild(itemIcon);
    title.innerHTML = span.outerHTML + data.title;
    listItem.appendChild(title);
    body.appendChild(listItem);

    content.appendChild(body);

    node.appendChild(content);
    wrapper.appendChild(node);

    if(hasChildren) {
      this.children = [];
      data.children.map((v: ListItemElem, i: number) => {
        const _node = new Node(wrapper, this);
        _node.create(v, level+1, /* nodeRender, */onClick, onDblClick, selectedIds, onChange);
        this.children.push(_node);
      });
    }

    this.container.appendChild(wrapper);
  }
}