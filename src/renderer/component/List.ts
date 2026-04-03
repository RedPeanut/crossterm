import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { BodyLayoutService } from "../layout/BodyLayout";
import { SessionPartService } from "../part/SessionPart";
import { bodyLayoutServiceId, bookmarkPanelServiceId, sessionPartServiceId, getService, } from "../Service";
import { $, append } from "../util/dom";
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

  onClick: (id: string) => void;
  onDblClick: (id: string) => void;

  // tree: Tree;
  tree: HTMLElement;
  nodes: Node[];

  constructor(container: HTMLElement, list: ListItemElem[],
    onClick: (id: string) => void,
    onDblClick: (id: string) => void
  ) {
    this.container = container;
    this.state = {
      selectedIds: [],
      list: list || []
    };
    this.onClick = onClick;
    this.onDblClick = onDblClick;
  }

  _onClick(id: string): void {
  }

  _onDblClick(id: string): void {
    // console.log('_onDblClick() is called..., id =', id);
    this.onDblClick(id);
  }

  create(): void {
    const list = this.element = $('.list');
    const tree = this.tree = $('.tree');
    this.nodes = [];
    // const list = this.state.showList;
    this.state.list.map((v: ListItemElem, i: number) => {
      const node = new Node(tree);
      node.create(v, 0,
        // nodeRender,
        this._onClick.bind(this), this._onDblClick.bind(this), this.state.selectedIds);
      this.nodes.push(node);
    });

    append(list, tree);
    append(this.container, list);
  }
}

export class Node implements Children {
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
    // nodeRender: (data: ListItemElem) => HTMLElement | null,
    onClick: (id: string) => void,
    onDblClick: (id: string) => void,
    selectedIds: string[]
  ): void {
    this.id = data.id;

    const isSelected = selectedIds.includes(data.id);
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;
    const isCollapsed = data.isCollapsed == null || data.isCollapsed == undefined
      ? true : data.isCollapsed;

    const wrapper = this.element = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${level * 20 + 4}px`;

    node.onclick = (e: MouseEvent) => {
      onClick(data.id);
      // const bookmarkPanelService = getService(bookmarkPanelServiceId);
      // bookmarkPanelService.onSelect(data.id);
    };
    node.ondblclick = (e: MouseEvent) => onDblClick(data.id);

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
    // const listItem = nodeRender ? nodeRender(data) : data.title || `node#${data.id}`;
    // body.append(listItem);

    const listItem = $('.list-item');
    const title = $('.title');
    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' :
      data.type === 'local' ? 'note' /* 'package' */ :
      data.type === 'remote' ? 'globe' : data.type;
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    append(span, itemIcon);
    title.innerHTML = span.outerHTML + data.title;
    append(listItem, title);
    body.append(listItem);

    content.append(body);

    append(node, content);
    append(wrapper, node);

    if(hasChildren) {
      this.children = [];
      data.children.map((v: ListItemElem, i: number) => {
        const _node = new Node(wrapper);
        _node.create(v, level+1, /* nodeRender, */onClick, onDblClick, selectedIds);
        this.children.push(_node);
      });
    }

    append(this.container, wrapper);
  }
}