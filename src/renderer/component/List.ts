import { KeyboardInputEvent } from "electron";
import { renderer } from "..";
import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { Disposable, _addEventListener } from "../util/lifecycle";
import { IDisposable } from "../../common/base/lifecycle";
import { $ } from "../util/dom";
import * as dom from "../util/dom";
import { findActiveItem, Children } from "../utils";
import * as utils from "../utils";
import { v4 as uuidv4 } from 'uuid';
import { contextViewServiceId, getService, mainLayoutServiceId } from "../Service";
import { ContextViewService } from "../service/ContextViewService";
import { Severity } from "../Types";

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
}

const SCROLL_HIDE_TIMEOUT: number = 500;

export interface ListOptions {}

export class ListDragAndDrop implements IDisposable {

  autoExpandNode: Node | undefined;
  // autoExpandDisposable: IDisposable = Disposable.None;
  // disposables = new DisposableStore();
  timer: NodeJS.Timeout;

  constructor() {}

  onDragStart() {}
  onDragEnd() {}
  onDragEnter() {}
  onDragLeave() {}

  onDragOver(targetNode: Node) {
    // let timer;

    const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
    if(didChangeAutoExpandNode) {
      // this.autoExpandDisposable.dispose();
      if(this.timer) { clearTimeout(this.timer); this.timer = null; };
      this.autoExpandNode = targetNode;
    }

    if(didChangeAutoExpandNode) {
      this.timer = setTimeout(() => {
        if(this.autoExpandNode?.isCollapsed) {
          // do expand
          this.autoExpandNode.setCollapsed(false);
        }
        this.autoExpandNode = undefined;
      }, 500);
    }
  }

  onDrop() {}

  dispose() {
    if(this.timer) { clearTimeout(this.timer); this.timer = null; };
  }
}

export class List extends Disposable {
  container: HTMLElement;
  element: HTMLElement;

  // showList: ListItem[];
  state: {
    selectedIds: string[],
    items: ListItemElem[],
  };

  onClick: (e: MouseEvent, id: string) => void;
  onDblClick: (e: MouseEvent, id: string) => void;

  // tree: Tree;
  tree: HTMLElement;
  nodes: Node[];

  // scrollable: HTMLElement;
  scrollbar_v: HTMLElement;
  slider: HTMLElement;
  isDragging: boolean;
  mouseIsOver: boolean;
  dnd: ListDragAndDrop;

  constructor(container: HTMLElement, items: ListItemElem[],
    onClick: (e: MouseEvent, id: string) => void,
    onDblClick: (e: MouseEvent, id: string) => void
  ) {
    super();
    this.container = container;
    this.state = {
      selectedIds: [],
      items: items || []
    };
    this.onClick = onClick;
    this.onDblClick = onDblClick;
    this.dnd = new ListDragAndDrop();
  }

  _onClick(e: MouseEvent, id: string): void {
    // console.log('_onClick is called ..');
    const shortenedId = id.substring(0, 7);
    const { selectedIds } = this.state;

    const flattened = utils.flatten(this.nodes);
    // const find = flattened.find((v) => v.id === id);
    let i: number, find: Node = null, findIdx: number;
    for(i = 0; i < flattened.length; i++) {
      if(flattened[i].shortenedId == shortenedId) {
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
          selectedIds.push(shortenedId);
        }
      } else {
        for(i = from+1; i <= to; i++) {
          flattened[i].node.classList.add('selected');
          selectedIds.push(shortenedId);
        }
      }

    } else if(cmdOrCtrlKey) {
      const isSelected = selectedIds.includes(shortenedId);
      const selectedIdx = selectedIds.findIndex((v) => v == shortenedId);

      if(isSelected) {
        find.node.classList.remove('selected');
        selectedIds.splice(selectedIdx, 1);
      } else {
        find.node.classList.add('selected');
        selectedIds.push(shortenedId);
      }
    } else {
      for(i = 0; i < flattened.length; i++) {
        flattened[i].node.classList.remove('selected');
      }

      find.node.classList.add('selected');
      // selectedIds = [ id ];
      this.state = {
        ...this.state,
        selectedIds: [ shortenedId ]
      };
    }

    this.onClick(e, id);
    // e.stopPropagation();
  }

  _onDblClick(e: MouseEvent, id: string): void {
    // console.log('_onDblClick() is called..., id =', id);
    this.onDblClick(e, id);
  }

  _toggleCollapsed(id: string, data: { isCollapsed: boolean }): void {
    // console.log('_onChange() is called..., id =', id);
    this.setScrollVisibility();
    const flattened = utils.flatten(this.state.items);
    const findItem = flattened.find((item) => item.id === id);
    findItem.isCollapsed = data.isCollapsed;
  }

  create(): void {
    const listEl: HTMLElement = this.element = $('.list');
    listEl.classList.add('scrollable');
    // const scrollable = this.scrollable = $('.scrollable');

    this._register(_addEventListener(listEl, 'wheel', (e: WheelEvent) => {
      let deltaX: number, deltaY: number = e.deltaY;

      // consume all event n write
      const el = e.currentTarget as HTMLElement;
      const {
        scrollLeft, scrollTop, scrollWidth, scrollHeight,
        clientLeft, clientTop, clientWidth, clientHeight,
      } = el;

      let _scrollTop, MAX_SCROLL_TOP = scrollHeight - clientHeight;
      if(scrollTop + deltaY + clientHeight > scrollHeight) {
        _scrollTop = MAX_SCROLL_TOP;
      } else if(scrollTop + deltaY < 0)
        _scrollTop = 0;
      else
        _scrollTop = scrollTop + deltaY;

      this.element.scrollTop = _scrollTop;
      // this.slider.style.top = (scrollTop * clientHeight / scrollHeight).toFixed(2) + 'px';
      this.slider.style.top = Math.ceil(_scrollTop * clientHeight / scrollHeight) + 'px';
    }));

    this._register(_addEventListener(listEl, 'mouseover', (e: MouseEvent) => {
      this.mouseIsOver = true;
      this.setScrollVisibility();
    }));
    this._register(_addEventListener(listEl, 'mouseleave', (e: MouseEvent) => {
      this.mouseIsOver = false;
      if(this.scrollbar_v.classList.contains('visible')) {
        this.scrollbar_v.classList.remove('visible');

        const {
          clientLeft, clientTop, clientWidth, clientHeight,
          scrollLeft, scrollTop, scrollWidth, scrollHeight,
          offsetLeft, offsetTop, offsetWidth, offsetHeight
        } = this.element;

        if(scrollHeight > clientHeight) {
          this.scrollbar_v.classList.add('fade');
        }

        this.scrollbar_v.classList.add('invisible');
      }
    }));

    this._register(_addEventListener(listEl, 'click', (e: MouseEvent) => {
      // console.log('click event is called ..');

      // is this right clear selected in here?
      const flattened = utils.flatten(this.nodes);
      for(let i = 0; i < flattened.length; i++) {
        flattened[i].node.classList.remove('selected');
      }

      this.state = {
        ...this.state,
        selectedIds: []
      };
    }));
    const tree = this.tree = $('.tree');
    this.nodes = [];
    // const list = this.state.showList;
    this.state.items.map((v: ListItemElem, i: number) => {
      const node = new Node(tree, null, this.dnd,
        this._toggleCollapsed.bind(this));
      node.create(v, 0,
        // nodeRender,
        this._onClick.bind(this),
        this._onDblClick.bind(this),
        this.state.selectedIds
      );
      this.nodes.push(node);
    });

    const scrollbar_v = this.scrollbar_v = $('.scrollbar.vertical.invisible');
    const slider = this.slider = $('.slider');
    scrollbar_v.appendChild(slider);

    listEl.appendChild(tree);
    this.container.appendChild(listEl);
    // this.container.appendChild(scrollable);
    this.container.appendChild(scrollbar_v);
  }

  scrollHide(): void {
    if (!this.mouseIsOver && !this.isDragging) {
      if(this.scrollbar_v.classList.contains('visible')) {
        this.scrollbar_v.classList.remove('visible');
        this.scrollbar_v.classList.add('invisible');
      }
    }
  }

  scheduleScrollHide(): void {
    if(!this.mouseIsOver && !this.isDragging) {
      let scrollHideTimeout: NodeJS.Timeout;
      if(scrollHideTimeout)
        clearTimeout(scrollHideTimeout);
      scrollHideTimeout = setTimeout(this.scrollHide.bind(this), SCROLL_HIDE_TIMEOUT);
    }
  }

  setScrollVisibility() {
    const {
      clientLeft, clientTop, clientWidth, clientHeight,
      scrollLeft, scrollTop, scrollWidth, scrollHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.element;

    if(scrollHeight > clientHeight) {
      this.scrollbar_v.classList.remove('invisible');
      this.scrollbar_v.classList.add('visible');

      setTimeout(() => {
        const {
          clientLeft, clientTop, clientWidth, clientHeight,
          scrollLeft, scrollTop, scrollWidth, scrollHeight,
          offsetLeft, offsetTop, offsetWidth, offsetHeight
        } = this.element;
        // console.log(`clientHeight = ${clientHeight}, scrollHeight = ${scrollHeight}`);
        // console.log((clientHeight / scrollHeight * 100).toFixed(2) + '%');
        this.slider.style.height = (clientHeight / scrollHeight * 100).toFixed(2) + '%';
      }, 10);
    } else {
      this.scrollbar_v.classList.remove('visible');
      this.scrollbar_v.classList.remove('fade');
      this.scrollbar_v.classList.add('invisible');
    }
  }

  addNode(type: string) {
    // add node in first folder start with selected or not

    const { selectedIds } = this.state;
    // const anySelected = selectedIds.length > 0;
    const flattened = utils.flatten(this.nodes);
    let targetNode: Node = null;

    let depth = 0;

    if(selectedIds.length > 0) {
      // find first folder from last selected?
      const findId = selectedIds[selectedIds.length-1];
      const findNode = flattened.find((v) => v.shortenedId === findId);

      if(findNode) {
        // targetNode is always folder
        if(findNode.type == 'folder') {
          targetNode = findNode;

          // find depth when folder
          let node = targetNode.parent;
          depth++;

          for(; node != null;) {
            node = node.parent;
            depth++;
          }
        } else {
          targetNode = findNode.parent;

          // find depth when file
          let node = targetNode;

          for(; node != null;) {
            node = node.parent;
            depth++;
          }
        }
      }

      console.log('depth =', depth);
    }

    const data: ListItemElem = {
      type: type == 'folder' ? 'folder' : 'local',
      id: uuidv4()
    };

    const containerDom = targetNode == null ? this.tree : targetNode.wrapper;
    const node: Node = new Node(containerDom, targetNode, this.dnd, this._toggleCollapsed.bind(this));
    const nodeList: Node[] = targetNode == null ? this.nodes : targetNode.children;

    node.createEdit(data, depth,
      ///*
      () => { // onCancel
        node.dispose();

        // delete dom
        if(targetNode == null) {
          // remove from this.tree
          this.tree.removeChild(node.wrapper);
        } else {
          // remove from targetNode.wrapper
          targetNode.wrapper.removeChild(node.wrapper);
        }
      },
      () => { // onFinish
        node.input.style.display = 'none';
        node.titleEl.innerHTML = node.input.value;
        node.titleEl.style.display = 'inline-block';

        node._register(_addEventListener(node.node, 'click', (e: MouseEvent) => {
          // onClick(e, data.id.substring(0, 7));
          this._onClick(e, data.id.substring(0, 7));
        }));
        node._register(_addEventListener(node.node, 'dblclick', (e: MouseEvent) => {
          // onDblClick(e, data.id);
          this._onDblClick(e, data.id);
        }));

        // move dom n node

        let nodeList: Node[];
        let rootDom: HTMLElement;

        if(targetNode == null) {
          nodeList = this.nodes;
          rootDom = this.tree;

          if(type == 'folder') {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for(let i = 0; i < nodeList.length; i++) {
              if(nodeList[i].type == 'folder') {
                if(nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if(!found) {
              targetPos = nodeList.findIndex((v) => ['local', 'remote'].includes(v.type));
              if(targetPos == -1) last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if(last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, rootDom.children[targetPos]);

            // append in node list
            if(last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          } else {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for(let i = 0; i < nodeList.length; i++) {
              if(['local', 'remote'].includes(nodeList[i].type)) {
                if(nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if(!found) {
              // targetPos = this.nodes.length-1;
              last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if(last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, rootDom.children[targetPos]);

            // append in node list
            if(last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          }

        } else {
          nodeList = targetNode.children;
          rootDom = targetNode.wrapper;

          if(type == 'folder') {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for(let i = 0; i < nodeList.length; i++) {
              if(nodeList[i].type == 'folder') {
                if(nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if(!found) {
              targetPos = nodeList.findIndex((v) => ['local', 'remote'].includes(v.type));
              if(targetPos == -1) last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if(last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, Array.from(rootDom.children).slice(1)[targetPos]);

            // append in node list
            if(last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          } else {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for(let i = 0; i < nodeList.length; i++) {
              if(['local', 'remote'].includes(nodeList[i].type)) {
                if(nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if(!found) {
              // targetPos = this.nodes.length-1;
              last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if(last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, Array.from(rootDom.children).slice(1)[targetPos]);

            // append in node list
            if(last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          }
        }

      }
      //*/
    );
    this.setScrollVisibility();
    // TODO: scrollTo if necessary
  }

  collapseAll() {
    this.setScrollVisibility();
  }

}

export class Node extends Disposable implements Children {
  container: HTMLElement;
  wrapper: HTMLElement;
  node: HTMLElement;
  input: HTMLInputElement;
  titleEl: HTMLElement;

  parent: Node;
  children: Node[] = [];

  id: string;
  shortenedId: string;
  type: string;
  isCollapsed: boolean = false;

  targetNode: Node | undefined;
  dnd: ListDragAndDrop;
  toggleCollapsed: (id: string, data: { isCollapsed: boolean }) => void;

  constructor(container: HTMLElement, parent: Node,
    dnd: ListDragAndDrop,
    toggleCollapsed: (id: string, data: { isCollapsed: boolean }) => void
  ) {
    super();
    this.container = container;
    this.parent = parent;
    this.dnd = dnd;
    this.toggleCollapsed = toggleCollapsed;
  }

  create(
    data: ListItemElem,
    level: number = 0,
    // nodeRender: (data: ListItemElem) => HTMLElement | null,
    onClick: (e: MouseEvent, id: string) => void,
    onDblClick: (e: MouseEvent, id: string) => void,
    selectedIds: string[]
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

    this._register(_addEventListener(node, 'click', (e: MouseEvent) => {
      // onClick(e, data.id);
      // const bookmarkPanelService = getService(bookmarkPanelServiceId);
      // bookmarkPanelService.onSelect(data.id);
      e.stopPropagation();
    }));
    this._register(_addEventListener(node, 'dblclick', (e: MouseEvent) => {
      onDblClick(e, data.id);
    }));

    this._register(_addEventListener(node, 'mousedown', (e: MouseEvent) => {
      // console.log('mousedown event is called...');
      onClick(e, data.id);
      // e.stopPropagation();
    }));

    node.draggable = true;
    this._register(_addEventListener(node, 'dragstart', (e: DragEvent) => {
      console.log('dragstart event is called...');

      // const elements = get drag elements ();

      const uri = data.title;
      console.log('uri =', uri);
      e.dataTransfer.setData('text/plain', uri);
      e.dataTransfer.effectAllowed = 'copyMove'; // 'none' | 'copyMove'

      if(e.dataTransfer.setDragImage) {
        const dragImage = $('.drag-image');
        let label: string | undefined = uri;
        // label = String(elements.length);
        dragImage.textContent = label;

        const getDragImageContainer = (e: HTMLElement | null) => {
          while(e && !(e.classList.contains('layout') && e.classList.contains('main'))) {
            e = e.parentElement;
          }
          return e || node.ownerDocument;
        };

        const container = getDragImageContainer(node);
        // console.log('container =', container);
        container.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, -10, -10);
        setTimeout(() => container.removeChild(dragImage), 0);
      }

      node.classList.add('dragging');

    }));
    this._register(_addEventListener(node, 'dragend', (e: DragEvent) => {
      console.log('dragend event is called...');
      node.classList.remove('dragging');
    }));
    this._register(_addEventListener(node, 'dragenter', (e: DragEvent) => {
      console.log('dragenter event is called...');
    }));
    this._register(_addEventListener(node, 'dragleave', (e: DragEvent) => {
      console.log('dragleave event is called...');

      if(this.targetNode) {
        this.targetNode.wrapper.classList.remove('drop-target');
        this.targetNode = undefined;
      }
    }));
    this._register(_addEventListener(node, 'dragover', (e: DragEvent) => {
      console.log('dragover event is called...');
      e.preventDefault();

      // find target node (first folder node, null if not exist)
      let findNode: Node = this, targetNode: Node = null;

      for(;findNode !== null && findNode.type !== 'folder';) {
        findNode = findNode.parent;
      }

      if(findNode) {
        this.targetNode = targetNode = findNode;
        this.targetNode.wrapper.classList.add('drop-target');
      }

      this.dnd.onDragOver(targetNode);
    }));

    this._register(_addEventListener(node, 'drop', (e: DragEvent) => {
      console.log('drop event is called...');
      e.preventDefault();

      node.classList.remove('dragging');

      if(this.targetNode) {
        this.targetNode.wrapper.classList.remove('drop-target');
        this.targetNode = undefined;
      }
    }));

    const content = $('.content');
    const header = $('.ln-header');
    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) wrapper.classList.add('collapsed');
      this._register(_addEventListener(arrow, 'click', (e: MouseEvent) => {
        const isCollapsed = wrapper.classList.contains('collapsed');
        const toggled = !isCollapsed;
        this.setCollapsed(toggled);
        e.stopPropagation();
      }));

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
    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' :
      data.type === 'local' ? 'note' /* 'package' */ :
      data.type === 'remote' ? 'globe' : data.type;
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    span.appendChild(itemIcon);
    listItem.appendChild(span);

    const titleEl = this.titleEl = $('span.title');
    titleEl.innerHTML = data.title;
    listItem.appendChild(titleEl);

    body.appendChild(listItem);
    content.appendChild(body);

    node.appendChild(content);
    wrapper.appendChild(node);

    if(hasChildren) {
      // this.children = [];
      data.children.map((v: ListItemElem, i: number) => {
        const _node = new Node(wrapper, this, this.dnd, this.toggleCollapsed);
        _node.create(v, level+1, /* nodeRender, */onClick, onDblClick, selectedIds);
        this.children.push(_node);
      });
    }

    this.container.appendChild(wrapper);
  }

  setCollapsed(isCollapsed: boolean) {
    this.isCollapsed = isCollapsed;
    if(isCollapsed)
      this.wrapper.classList.add('collapsed');
    else
      this.wrapper.classList.remove('collapsed');

    this.toggleCollapsed(this.id, { isCollapsed: isCollapsed });
  }

  createEdit(data: ListItemElem, level: number = 0,
    onCancel: () => void, onFinish: () => void
  ): void {
    this.id = data.id;
    this.shortenedId = data.id.substring(0, 7);
    this.type = data.type;

    // this.isCollapsed = true;

    const wrapper = this.wrapper = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${level * 20 + 4}px`;

    const content = $('.content');
    const header = $('.ln-header');

    if(data.type == 'folder') {
      const arrow = $('.arrow');
      wrapper.classList.add('collapsed');
      const collapseArrow = $('a.codicon.codicon-chevron-right');
      arrow.appendChild(collapseArrow);
      header.appendChild(arrow);
    }
    content.appendChild(header);

    const body = $('.ln-body');
    const listItem = $('.list-item');

    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' : 'note';
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    span.appendChild(itemIcon);
    listItem.appendChild(span);

    const input = this.input = $('input.title');

    this._register(_addEventListener(input, 'keydown', (e: KeyboardEvent) => {
      if(e.key === 'Escape') {
        onCancel();
      } else if(e.key === 'Enter') {
        onFinish();
      }
    }));

    this._register(_addEventListener(input, 'input', (e: KeyboardEvent) => {

      // console.log('input.value =', input.value);

      // validate n show message box

      function validate(name: string): { content: string; severity: Severity } | null {

        // Name not provided
        if(!name || name.length === 0 || /^\s+$/.test(name)) {
          return {
            content: 'Name must be provided.', // emptyNameError
            severity: Severity.Error
          };
        }

        /* // Do not allow to overwrite existing
        return {
          content: `**${name}** already exists at this location. Please choose a different name.`, // nameExistsError
          severity: Severity.Error
        }; */

        // const names = coalesce(name.split(/[\\/]/));
        // if(names.some(name => /^\s|\s$/.test(name))) {
        if(/^\s|\s$/.test(name)) {
          return {
            content: `Leading or trailing whitespace detected in name.`, // nameWhitespaceWarning
            severity: Severity.Warning
          };
        }

        return null;
      }

      let errorMsg = validate(input.value);
      if(errorMsg) {

        input.classList.remove('idle');
        input.classList.remove('info');
        input.classList.remove('warning');
        input.classList.remove('error');

        function classFor(severity: Severity): string {
          switch(severity) {
            case Severity.Info: return 'info';
            case Severity.Warning: return 'warning';
            default: return 'error';
          }
        }

        input.classList.add(classFor(errorMsg.severity));

        function stylesFor(severity: Severity): { border: string | undefined; background: string | undefined; foreground: string | undefined } {
          switch(severity) {
            // case Severity.Info: return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
            case Severity.Warning: return { border: 'rgb(184 149 0)', background: 'rgb(53 42 5)', foreground: 'white' };
            default: return { border: 'rgb(190 17 0)', background: 'rgb(90 29 29)', foreground: 'white' };
          }
        }

        const styles = stylesFor(errorMsg.severity);
        input.style.border = `1px solid ${styles.border}`;

        let div: HTMLElement;

        const layout = () => {
          const totalWidth = dom.getTotalWidth(input);
          return div.style.width = totalWidth + 'px';
        };

        (getService(contextViewServiceId) as ContextViewService).show({
          getAnchor: () => input,
          render: (container: HTMLElement) => {
            div = dom.append(container, $('.input-msgbox'));
            layout();

            const spanElement = document.createElement('span');
            spanElement.textContent = errorMsg.content;
            spanElement.classList.add(classFor(errorMsg.severity));

            const styles = stylesFor(errorMsg.severity);
            spanElement.style.backgroundColor = styles.background ?? '';
            spanElement.style.color = styles.foreground ?? '';
            spanElement.style.border = styles.border ? `1px solid ${styles.border}` : '';

            dom.append(div, spanElement);
          },
          onHide: null
        });
      } else {
        input.classList.remove('info');
        input.classList.remove('warning');
        input.classList.remove('error');
        input.classList.add('idle');

        (getService(contextViewServiceId) as ContextViewService).hide();

        // reset
        input.style.border = 'transparent';
      }

    }));
    this._register(_addEventListener(input, 'blur', (e: UIEvent) => {

    }));
    listItem.appendChild(input);

    const titleEl = this.titleEl = $('span.title');
    titleEl.style.display = 'none';
    listItem.appendChild(titleEl);

    body.appendChild(listItem);
    content.appendChild(body);

    node.appendChild(content);
    wrapper.appendChild(node);

    if(level > 0) {
      if(data.type == 'folder') {
        const at = Array.from(this.container.children).slice(1)[0]
        this.container.insertBefore(wrapper, at || null);
      } else {
        const at = Array.from(this.container.children).slice(1).find((v) => (v as HTMLElement).dataset.type !== 'folder');
        this.container.insertBefore(wrapper, at || null);
      }
    } else {
      if(data.type == 'folder') {
        this.container.insertBefore(wrapper, Array.from(this.container.children)[0] || null);
      } else {
        const at = Array.from(this.container.children).find((v) => (v as HTMLElement).dataset.type !== 'folder');
        this.container.insertBefore(wrapper, at || null);
      }
    }

    input.focus();
  }

}