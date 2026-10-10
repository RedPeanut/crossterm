import { KeyboardInputEvent } from "electron";
import { renderer } from "..";
import { Children, DirentExt, ListItemElem, ContextMenuItem, TerminalItem } from "../../common/Types";
// import { wrapper } from "../globals";
import { IDisposable, Disposable, DisposableStore } from "../../common/base/lifecycle";
import { $, _addEventListener } from "../util/dom";
import * as dom from "../util/dom";
import { findActiveItem } from "../utils";
import * as utils from "../utils";
import { v4 as uuidv4 } from 'uuid';
import { contextViewServiceId, getService, mainLayoutServiceId, storageServiceId } from "../Service";
import { ContextViewService } from "../service/ContextViewService";
import { Severity } from "../Types";
import { popup } from "../util/contextmenu";
import { MainLayoutService } from "../layout/MainLayout";
import { StorageService, TreeViewStateType } from "../../common/service/StorageService";
import { FileServiceImpl } from "../service/RenderFileService";

const SCROLL_HIDE_TIMEOUT: number = 500;

const fileService = new FileServiceImpl();

export interface ListOptions {}

export class ListDragAndDrop implements IDisposable {

  autoExpandNode: Node | undefined;
  // autoExpandDisposable: IDisposable = Disposable.None;
  // disposables = new DisposableStore();
  timer: NodeJS.Timeout;
  list: List;

  constructor(list: List) {
    this.list = list;
  }

  onDragStart() {}
  onDragEnd() {}
  onDragEnter() {}
  onDragLeave() {}

  onDragOver(targetNode: Node) {
    // let timer;

    const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
    if (didChangeAutoExpandNode) {
      // this.autoExpandDisposable.dispose();
      if (this.timer) { clearTimeout(this.timer); this.timer = null; };
      this.autoExpandNode = targetNode;
    }

    if (didChangeAutoExpandNode) {
      this.timer = setTimeout(() => {
        if (this.autoExpandNode?.isCollapsed) {
          // do expand
          this.autoExpandNode.setCollapsed(false);
        }
        this.autoExpandNode = undefined;
      }, 500);
    }
  }

  onDrop() {}

  dispose() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; };
  }

  getDragElements(data: ListItemElem) {
    const selection = this.list.state.selectedIds.map((v, i) =>
      this.list.state.items.find(_v => _v.id.startsWith(v))
    );
    const elements = selection.indexOf(data) > -1 ? selection : [data];
    return elements;
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
  onSelectionChange: ((items: ListItemElem[]) => void) | undefined;

  // tree: Tree;
  tree: HTMLElement;
  nodes: Node[];

  // scrollable: HTMLElement;
  scrollbar_v: HTMLElement;
  slider: HTMLElement;
  isDragging: boolean;
  mouseIsOver: boolean;
  dnd: ListDragAndDrop;
  /** 키보드 포커스가 있는 노드의 shortenedId */
  focusedId: string | undefined;

  constructor(container: HTMLElement,
    items: ListItemElem[],
    treeViewState: TreeViewStateType,
    onClick: (e: MouseEvent, id: string) => void,
    onDblClick: (e: MouseEvent, id: string) => void,
    onSelectionChange?: (items: ListItemElem[]) => void
  ) {
    super();
    this.container = container;
    this.state = {
      selectedIds: [],
      items: items || []
    };
    utils.applyTreeViewState(this.state.items, treeViewState?.expanded || []);
    this.onClick = onClick;
    this.onDblClick = onDblClick;
    this.onSelectionChange = onSelectionChange;
    this.dnd = new ListDragAndDrop(this);
  }

  _onClick(e: MouseEvent, id: string): void {
    // console.log('_onClick is called ..');
    const shortenedId = id.substring(0, 7);
    const { selectedIds } = this.state;

    const flattened = utils.flatten(this.nodes);
    // const find = flattened.find((v) => v.id === id);
    let i: number, find: Node = null, findIdx: number;
    for (i = 0; i < flattened.length; i++) {
      if (flattened[i].shortenedId == shortenedId) {
        find = flattened[i];
        findIdx = i;
        break;
      }
    }

    const cmdOrCtrlKey = renderer.process.platform === 'darwin' ? e.metaKey : e.ctrlKey;
    /* if (cmdOrCtrlKey && e.shiftKey) {
      if (selectedIds.length == 0) return;

    } else */
    if (e.shiftKey) {
      if (selectedIds.length == 0) return;
      const lastSeletedId = selectedIds[selectedIds.length-1];

      let lastIdx: number;
      for (i = 0; i < flattened.length; i++) {
        if (flattened[i].shortenedId == lastSeletedId) {
          // find = flattened[i];
          lastIdx = i;
          break;
        }
      }

      // from ~ to
      let from: number = lastIdx, to: number = findIdx;
      if (from > to) {
        for (i = from-1; i >= to; i--) {
          flattened[i].node.classList.add('selected');
          selectedIds.push(shortenedId);
        }
      } else {
        for (i = from+1; i <= to; i++) {
          flattened[i].node.classList.add('selected');
          selectedIds.push(shortenedId);
        }
      }

    } else if (cmdOrCtrlKey) {
      const isSelected = selectedIds.includes(shortenedId);
      const selectedIdx = selectedIds.findIndex((v) => v == shortenedId);

      if (isSelected) {
        find.node.classList.remove('selected');
        selectedIds.splice(selectedIdx, 1);
      } else {
        find.node.classList.add('selected');
        selectedIds.push(shortenedId);
      }
    } else {
      for (i = 0; i < flattened.length; i++) {
        flattened[i].node.classList.remove('selected');
      }

      find.node.classList.add('selected');
      // selectedIds = [ id ];
      this.state = {
        ...this.state,
        selectedIds: [ shortenedId ]
      };
    }

    if (find) {
      this.setFocused(find);
    }

    this.notifySelectionChange();
    this.onClick(e, id);
    // e.stopPropagation();
  }

  /**
   * 현재 선택된 노드의 원본 데이터를 모아 선택 변경을 알린다.
   */
  notifySelectionChange(): void {
    if (!this.onSelectionChange) return;

    const flattened = utils.flatten(this.nodes);
    const items: ListItemElem[] = [];

    const shortenedIds = Array.from(new Set(this.state.selectedIds));
    for (let i = 0; i < shortenedIds.length; i++) {
      const find = flattened.find((node) => node.shortenedId === shortenedIds[i]);
      if (find?.data) {
        items.push(find.data);
      }
    }

    this.onSelectionChange(items);
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
    this.saveTreeViewState();
  }

  saveTreeViewState(): void {
    const storageService = getService(storageServiceId) as StorageService;
    const val = JSON.stringify({
      // focus: [],
      // selection: [],
      expanded: utils.collectExpandedPaths(this.state.items)
    });
    console.log('val =', val);
    storageService.set('treeViewState', val);
  }

  create(): void {
    const listEl: HTMLElement = this.element = $('.list');
    listEl.classList.add('scrollable');
    // 화살표 네비게이션을 받으려면 목록 자체가 포커스를 가질 수 있어야 한다
    listEl.tabIndex = 0;

    this._register(_addEventListener(listEl, 'keydown', (e: KeyboardEvent) => {
      this._onKeyDown(e);
    }));
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
      if (scrollTop + deltaY + clientHeight > scrollHeight) {
        _scrollTop = MAX_SCROLL_TOP;
      } else if (scrollTop + deltaY < 0)
        _scrollTop = 0;
      else
        _scrollTop = scrollTop + deltaY;

      this.setScrollTop(_scrollTop);
    }));

    this._register(_addEventListener(listEl, 'mouseover', (e: MouseEvent) => {
      this.mouseIsOver = true;
      this.setScrollVisibility();
    }));
    this._register(_addEventListener(listEl, 'mouseleave', (e: MouseEvent) => {
      this.mouseIsOver = false;
      if (this.scrollbar_v.classList.contains('visible')) {
        this.scrollbar_v.classList.remove('visible');

        const {
          clientLeft, clientTop, clientWidth, clientHeight,
          scrollLeft, scrollTop, scrollWidth, scrollHeight,
          offsetLeft, offsetTop, offsetWidth, offsetHeight
        } = this.element;

        if (scrollHeight > clientHeight) {
          this.scrollbar_v.classList.add('fade');
        }

        this.scrollbar_v.classList.add('invisible');
      }
    }));

    this._register(_addEventListener(listEl, 'click', (e: MouseEvent) => {
      // console.log('click event is called ..');

      // is this right clear selected in here?
      const flattened = utils.flatten(this.nodes);
      for (let i = 0; i < flattened.length; i++) {
        flattened[i].node.classList.remove('selected');
      }

      this.state = {
        ...this.state,
        selectedIds: []
      };

      this.notifySelectionChange();
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

    // add blank line at last for clear selection when full
    const node = new Node(tree, null, this.dnd,
      this._toggleCollapsed.bind(this)
    );
    node.createBlank();
    this.nodes.push(node);

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
      if (this.scrollbar_v.classList.contains('visible')) {
        this.scrollbar_v.classList.remove('visible');
        this.scrollbar_v.classList.add('invisible');
      }
    }
  }

  scheduleScrollHide(): void {
    if (!this.mouseIsOver && !this.isDragging) {
      let scrollHideTimeout: NodeJS.Timeout;
      if (scrollHideTimeout)
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

    if (scrollHeight > clientHeight) {
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

  /**
   * 스크롤 위치를 옮기면서 커스텀 스크롤바의 슬라이더도 함께 갱신한다.
   */
  setScrollTop(scrollTop: number): void {
    const { clientHeight, scrollHeight } = this.element;
    this.element.scrollTop = scrollTop;
    this.slider.style.top = Math.ceil(scrollTop * clientHeight / scrollHeight) + 'px';
  }

  /**
   * 화면에 보이는(펼쳐진) 노드를 위에서 아래 순서로 돌려준다.
   * 선택 해제용으로 맨 끝에 붙는 빈 줄 노드는 제외한다.
   */
  getVisibleNodes(): Node[] {
    return utils.flatten(this.nodes).filter((node) => !!node.id);
  }

  getFocusedNode(): Node | undefined {
    if (!this.focusedId) return undefined;
    return this.getVisibleNodes().find((node) => node.shortenedId === this.focusedId);
  }

  /**
   * 포커스 표시만 옮긴다. 선택 상태나 스크롤은 건드리지 않는다.
   */
  setFocused(node: Node): void {
    const flattened = utils.flatten(this.nodes);
    for (let i = 0; i < flattened.length; i++) {
      flattened[i].node.classList.remove('focused');
    }

    node.node.classList.add('focused');
    this.focusedId = node.shortenedId;
  }

  /**
   * 포커스와 선택을 함께 옮기고, 필요하면 보이도록 스크롤한다.
   */
  focusNode(node: Node): void {
    const flattened = utils.flatten(this.nodes);
    for (let i = 0; i < flattened.length; i++) {
      flattened[i].node.classList.remove('selected');
      flattened[i].node.classList.remove('focused');
    }

    node.node.classList.add('selected');
    node.node.classList.add('focused');
    this.focusedId = node.shortenedId;
    this.state = {
      ...this.state,
      selectedIds: [ node.shortenedId ]
    };

    this.notifySelectionChange();
    this.revealNode(node);
  }

  /**
   * 노드가 목록 밖으로 잘려 있으면 보이는 위치까지 스크롤한다.
   */
  revealNode(node: Node): void {
    const listEl = this.element;
    const nodeRect = node.node.getBoundingClientRect();
    const listRect = listEl.getBoundingClientRect();

    const top = nodeRect.top - listRect.top + listEl.scrollTop;
    const bottom = top + nodeRect.height;

    if (top < listEl.scrollTop) {
      this.setScrollTop(top);
    } else if (bottom > listEl.scrollTop + listEl.clientHeight) {
      this.setScrollTop(bottom - listEl.clientHeight);
    }
  }

  /**
   * 화살표/Home/End/Enter 로 목록을 이동하고 폴더를 펼치거나 접는다.
   */
  _onKeyDown(e: KeyboardEvent): void {
    // 이름 편집 중이면 입력에 맡긴다
    if (e.target instanceof HTMLInputElement) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const nodes = this.getVisibleNodes();
    if (nodes.length === 0) return;

    const focused = this.getFocusedNode();
    const index = focused ? nodes.indexOf(focused) : -1;
    let handled = true;

    switch (e.key) {
      case 'ArrowDown':
        this.focusNode(nodes[Math.min(index+1, nodes.length-1)]);
        break;

      case 'ArrowUp':
        this.focusNode(nodes[Math.max(index-1, 0)]);
        break;

      case 'ArrowRight':
        if (!focused) {
          this.focusNode(nodes[0]);
        } else if (focused.isDirectory && focused.isCollapsed) {
          focused.setCollapsed(false);
        } else if (!focused.isCollapsed && focused.children.length > 0) {
          this.focusNode(focused.children[0]);
        }
        break;

      case 'ArrowLeft':
        if (!focused) {
          this.focusNode(nodes[0]);
        } else if (focused.isDirectory && !focused.isCollapsed) {
          focused.setCollapsed(true);
        } else if (focused.parent) {
          this.focusNode(focused.parent);
        }
        break;

      case 'Home':
        this.focusNode(nodes[0]);
        break;

      case 'End':
        this.focusNode(nodes[nodes.length-1]);
        break;

      case 'F2':
        focused?.rename();
        break;

      case 'Enter':
        if (!focused) break;
        if (focused.isDirectory) {
          focused.setCollapsed(!focused.isCollapsed);
        } else {
          // 더블클릭과 같은 경로로 열리도록 이벤트를 그대로 흘려보낸다
          focused.node.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        }
        break;

      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  addNode(type: string) {
    // add node in first folder start with selected or not

    const { selectedIds } = this.state;
    // const anySelected = selectedIds.length > 0;
    const flattened = utils.flatten(this.nodes);
    let targetNode: Node = null;

    let depth = 0;

    if (selectedIds.length > 0) {
      // find first folder from last selected?
      const findId = selectedIds[selectedIds.length-1];
      const findNode = flattened.find((v) => v.shortenedId === findId);

      if (findNode) {
        // targetNode is always folder
        if (findNode.type == 'folder') {
          targetNode = findNode;

          // find depth when folder
          let node = targetNode.parent;
          depth++;

          for (; node != null;) {
            node = node.parent;
            depth++;
          }
        } else {
          targetNode = findNode.parent;

          // find depth when file
          let node = targetNode;

          for (; node != null;) {
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
        if (targetNode == null) {
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

        this._register(_addEventListener(node.node, 'click', (e: MouseEvent) => {
          // onClick(e, data.id);
          this._onClick(e, data.id);
          e.stopPropagation();
        }));
        this._register(_addEventListener(node.node, 'dblclick', (e: MouseEvent) => {
          // onDblClick(e, data.id);
          this._onDblClick(e, data.id);
        }));

        this._register(_addEventListener(node.node, 'mousedown', (e: MouseEvent) => {
          // console.log('mousedown event is called...');
          // this._onClick(e, data.id);
          // e.stopPropagation();
        }));

        // move dom n node

        let nodeList: Node[];
        let rootDom: HTMLElement;

        if (targetNode == null) {
          nodeList = this.nodes;
          rootDom = this.tree;

          if (type == 'folder') {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for (let i = 0; i < nodeList.length; i++) {
              if (nodeList[i].type == 'folder') {
                if (nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if (!found) {
              targetPos = nodeList.findIndex((v) => ['local', 'remote'].includes(v.type));
              if (targetPos == -1) last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if (last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, rootDom.children[targetPos]);

            // append in node list
            if (last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          } else {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for (let i = 0; i < nodeList.length; i++) {
              if (['local', 'remote'].includes(nodeList[i].type)) {
                if (nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if (!found) {
              // targetPos = this.nodes.length-1;
              last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if (last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, rootDom.children[targetPos]);

            // append in node list
            if (last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          }

        } else {
          nodeList = targetNode.children;
          rootDom = targetNode.wrapper;

          if (type == 'folder') {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for (let i = 0; i < nodeList.length; i++) {
              if (nodeList[i].type == 'folder') {
                if (nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if (!found) {
              targetPos = nodeList.findIndex((v) => ['local', 'remote'].includes(v.type));
              if (targetPos == -1) last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if (last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, Array.from(rootDom.children).slice(1)[targetPos]);

            // append in node list
            if (last)
              nodeList.push(node);
            else
              nodeList.splice(targetPos, 0, node);
            // console.log('this.nodes =', this.nodes);
          } else {
            let targetPos = 0, found: boolean = false, last: boolean = false;

            for (let i = 0; i < nodeList.length; i++) {
              if (['local', 'remote'].includes(nodeList[i].type)) {
                if (nodeList[i].titleEl.innerHTML > node.input.value) {
                  targetPos = i; found = true;
                  break;
                }
              }
            }

            if (!found) {
              // targetPos = this.nodes.length-1;
              last = true;
            }

            // remove n append in dom
            rootDom.removeChild(node.wrapper);
            if (last)
              rootDom.appendChild(node.wrapper);
            else
              rootDom.insertBefore(node.wrapper, Array.from(rootDom.children).slice(1)[targetPos]);

            // append in node list
            if (last)
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

type InputMessage = { content: string; severity: Severity };

/** VS Code 의 validateFileName 과 같은 규칙으로 새 이름을 검사한다 */
function validateFileName(name: string, siblingNames: string[]): InputMessage | null {

  // Name not provided
  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return {
      content: 'Name must be provided.', // emptyNameError
      severity: Severity.Error
    };
  }

  if (/[\\/]/.test(name)) {
    return {
      content: `A file or folder name cannot contain '/' or '\\'.`,
      severity: Severity.Error
    };
  }

  // Do not allow to overwrite existing
  // (macOS/Windows 는 대소문자를 구분하지 않으므로 대소문자 무시하고 비교)
  if (siblingNames.some(v => v.toLowerCase() === name.toLowerCase())) {
    return {
      content: `${name} already exists at this location. Please choose a different name.`, // nameExistsError
      severity: Severity.Error
    };
  }

  // const names = coalesce(name.split(/[\\/]/));
  // if (names.some(name => /^\s|\s$/.test(name))) {
  if (/^\s|\s$/.test(name)) {
    return {
      content: `Leading or trailing whitespace detected in name.`, // nameWhitespaceWarning
      severity: Severity.Warning
    };
  }

  return null;
}

/** input 아래에 ContextView 로 검증 메시지를 표시한다. message 가 null 이면 숨긴다 */
function showInputMessage(input: HTMLInputElement, message: InputMessage | null): void {
  input.classList.remove('idle');
  input.classList.remove('info');
  input.classList.remove('warning');
  input.classList.remove('error');

  if (!message) {
    input.classList.add('idle');

    (getService(contextViewServiceId) as ContextViewService).hide();

    // reset
    input.style.border = 'transparent';
    return;
  }

  function classFor(severity: Severity): string {
    switch (severity) {
      case Severity.Info: return 'info';
      case Severity.Warning: return 'warning';
      default: return 'error';
    }
  }

  input.classList.add(classFor(message.severity));

  function stylesFor(severity: Severity): { border: string | undefined; background: string | undefined; foreground: string | undefined } {
    switch (severity) {
      // case Severity.Info: return { border: styles.inputValidationInfoBorder, background: styles.inputValidationInfoBackground, foreground: styles.inputValidationInfoForeground };
      case Severity.Warning: return { border: 'rgb(184 149 0)', background: 'rgb(53 42 5)', foreground: 'white' };
      default: return { border: 'rgb(190 17 0)', background: 'rgb(90 29 29)', foreground: 'white' };
    }
  }

  const styles = stylesFor(message.severity);
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
      spanElement.textContent = message.content;
      spanElement.classList.add(classFor(message.severity));

      spanElement.style.backgroundColor = styles.background ?? '';
      spanElement.style.color = styles.foreground ?? '';
      spanElement.style.border = styles.border ? `1px solid ${styles.border}` : '';

      dom.append(div, spanElement);
    },
    onHide: null
  });
}

/** main 에서 받은 경로의 구분자(/ 또는 \\)를 유지하며 이어붙인다 */
function joinPath(dir: string, name: string): string {
  const sep = dir.includes('\\') && !dir.includes('/') ? '\\' : '/';
  return dir.endsWith(sep) ? dir + name : dir + sep + name;
}

export class Node extends Disposable implements Children<Node> {
  container: HTMLElement;
  wrapper: HTMLElement;
  node: HTMLElement;
  input: HTMLInputElement;
  titleEl: HTMLElement;

  parent: Node;
  children: Node[] = [];
  isCollapsed: boolean = false;
  isRenaming: boolean = false;

  id: string;
  shortenedId: string;
  type: string;
  isDirectory: boolean = false;
  data: ListItemElem | undefined;

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
    this.isDirectory = data.isDirectory === true;
    this.data = data;

    const isSelected = selectedIds.includes(data.id);
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;
    const isCollapsed = this.isCollapsed = data.isCollapsed == null || data.isCollapsed == undefined
      ? true : data.isCollapsed;

    const wrapper = this.wrapper = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${4+level*16}px`;

    if (
      // data.type !== 'folder' &&
      level !== 0
    ) {
      for (let i = 0; i < level; i++) {
        const indent = $('.indent');
        // 마지막에만 8이고 그전은 16으로
        indent.style.left = `${4+i*16+8}px`;
        const guide = $('.guide');
        indent.appendChild(guide);
        node.appendChild(indent);
      }
    }

    this._register(_addEventListener(node, 'click', (e: MouseEvent) => {
      onClick(e, data.id);
      e.stopPropagation();
    }));
    this._register(_addEventListener(node, 'dblclick', (e: MouseEvent) => {
      onDblClick(e, data.id);
    }));

    this._register(_addEventListener(node, 'mousedown', (e: MouseEvent) => {
      // console.log('mousedown event is called...');
      // onClick(e, data.id);
      // e.stopPropagation();
    }));

    node.draggable = true;
    this._register(_addEventListener(node, 'dragstart', (e: DragEvent) => {
      console.log('dragstart event is called...');

      const uri = data.title;
      console.log('uri =', uri);
      let label: string | undefined = uri;

      e.dataTransfer.setData('text/plain', uri);
      e.dataTransfer.effectAllowed = 'copyMove';

      if (e.dataTransfer.setDragImage) {
        const dragImage = $('.drag-image');

        const elements = this.dnd.getDragElements(data);
        if (elements.length > 1)
          label = String(elements.length);
        else
          label = uri;
        dragImage.textContent = label;

        const getDragImageContainer = (e: HTMLElement | null) => {
          while (e && !(e.classList.contains('layout') && e.classList.contains('main'))) {
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

      if (this.targetNode) {
        this.targetNode.wrapper.classList.remove('drop-target');
        this.targetNode = undefined;
      }
    }));
    this._register(_addEventListener(node, 'dragover', (e: DragEvent) => {
      console.log('dragover event is called...');
      e.preventDefault();

      // find target node (first folder node, null if not exist)
      let findNode: Node = this, targetNode: Node = null;

      for (;findNode !== null && findNode.type !== 'folder';) {
        findNode = findNode.parent;
      }

      if (findNode) {
        this.targetNode = targetNode = findNode;
        this.targetNode.wrapper.classList.add('drop-target');
      }

      this.dnd.onDragOver(targetNode);
    }));

    this._register(_addEventListener(node, 'drop', (e: DragEvent) => {
      console.log('drop event is called...');
      e.preventDefault();

      node.classList.remove('dragging');

      if (this.targetNode) {
        this.targetNode.wrapper.classList.remove('drop-target');
        this.targetNode = undefined;
      }
    }));

    const content = $('.content');

    // const onProperties = () => {
    //   (getService(mainLayoutServiceId) as MainLayoutService).showPopup('properties', data);
    // }; // this.properties();

    this._register(_addEventListener(content, 'contextmenu', (e: PointerEvent) => {
      const items: ContextMenuItem[] = [];

      // TODO: 상황별 메뉴 생성

      // create new file n new folder when ...
      // create copy, cut when item is selected
      // create paste when clipboard are exists
      // create rename, delete when item is selected

      items.push(
        {
          label: 'New File...',
          accelerator: '',
          click: () => {}
        },
        {
          label: 'New Folder...',
          accelerator: '',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'Cmd+X',
          click: () => {}
        },
        {
          label: 'Copy',
          accelerator: 'Cmd+C',
          click: () => {}
        },
        {
          label: 'Paste',
          accelerator: 'Cmd+V',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Rename',
          accelerator: 'F2',
          click: () => this.rename()
        },
        {
          label: 'Delete',
          accelerator: 'Cmd+Back',
          click: () => {}
        },
        { type: 'separator' },
        {
          label: 'Properties',
          accelerator: 'P',
          click: () => {
            (getService(mainLayoutServiceId) as MainLayoutService).showPopup('properties', data);
          }
        }
      );
      popup(items);
    }));

    const header = $('.ln-header');
    if (data.isDirectory) {
      const arrow = $('.arrow');
      if (isCollapsed) wrapper.classList.add('collapsed');
      this._register(_addEventListener(arrow, 'click', (e: MouseEvent) => {
        const isCollapsed = wrapper.classList.contains('collapsed');
        const toggled = !isCollapsed;
        this.setCollapsed(toggled);
        e.stopPropagation();
      }));

      const collapseArrow = $('a.codicon.codicon-chevron-right');
      if (collapseArrow)
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
    if (data.type !== 'folder') {
      const itemIcon = $(`a.codicon.codicon-${codicon}`);
      span.appendChild(itemIcon);
    }
    listItem.appendChild(span);

    const titleEl = this.titleEl = $('span.title');
    titleEl.innerHTML = data.title;
    listItem.appendChild(titleEl);

    body.appendChild(listItem);
    content.appendChild(body);

    node.appendChild(content);
    wrapper.appendChild(node);

    if (hasChildren) {
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
    if (isCollapsed)
      this.wrapper.classList.add('collapsed');
    else
      this.wrapper.classList.remove('collapsed');

    this.toggleCollapsed(this.id, { isCollapsed: isCollapsed });
  }

  /** 같은 폴더에 있는 다른 노드들 (마지막 blank 노드 제외) */
  getSiblings(): Node[] {
    const siblings = this.parent ? this.parent.children : this.dnd.list.nodes;
    return siblings.filter(v => v !== this && v.titleEl);
  }

  /**
   * 제목 자리에 input 을 띄워 이름을 편집하고, 확정하면 디스크의 파일/폴더 이름을 바꾼다.
   * VS Code 탐색기와 같이 Enter 는 확정, Escape 는 취소, 포커스를 잃으면 확정(오류면 취소)한다.
   */
  rename(): void {
    if (this.isRenaming || !this.titleEl || !this.data?.path) return;
    this.isRenaming = true;

    const titleEl = this.titleEl;
    const oldName = titleEl.textContent;
    const siblingNames = this.getSiblings().map(v => v.titleEl.textContent);
    const store = new DisposableStore();
    let isCommitting = false;

    const input = $('input.title') as HTMLInputElement;
    input.value = oldName;
    titleEl.style.display = 'none';
    titleEl.after(input);

    // 편집 중에는 드래그, 노드 클릭(선택)/더블클릭(열기)이 일어나지 않도록 한다
    this.node.draggable = false;
    for (const type of ['click', 'dblclick', 'mousedown']) {
      store.add(_addEventListener(input, type, (e: MouseEvent) => e.stopPropagation()));
    }

    const finish = () => {
      store.dispose();
      showInputMessage(input, null);
      input.remove();
      titleEl.style.display = '';
      this.node.draggable = true;
      this.isRenaming = false;
      this.dnd.list.element.focus();
    };

    const commit = async (cancelOnError: boolean) => {
      if (isCommitting) return;

      const newName = input.value;
      if (newName === oldName) {
        finish();
        return;
      }

      const message = validateFileName(newName, siblingNames);
      if (message?.severity === Severity.Error) {
        if (cancelOnError) finish();
        else showInputMessage(input, message);
        return;
      }

      isCommitting = true;
      try {
        await fileService.move(joinPath(this.data.path, oldName), joinPath(this.data.path, newName));
      } catch (error) {
        isCommitting = false;
        showInputMessage(input, { content: (error as Error).message, severity: Severity.Error });
        input.focus();
        return;
      }

      this.applyRename(oldName, newName);
      finish();
    };

    store.add(_addEventListener(input, 'keydown', (e: KeyboardEvent) => {
      e.stopPropagation(); // 목록/전역 키바인딩으로 흘러가지 않게

      if (e.key === 'Enter') {
        e.preventDefault();
        commit(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      }
    }));
    store.add(_addEventListener(input, 'input', () => {
      showInputMessage(input, input.value === oldName ? null : validateFileName(input.value, siblingNames));
    }));
    store.add(_addEventListener(input, 'blur', () => {
      commit(true);
    }));

    input.focus();
    // 파일은 확장자를 뺀 부분만 선택 (VS Code 와 동일)
    const lastDot = oldName.lastIndexOf('.');
    input.setSelectionRange(0, !this.isDirectory && lastDot > 0 ? lastDot : oldName.length);
  }

  /** 디스크 rename 이 끝난 뒤 제목, data, 하위 항목 경로, 정렬 위치를 갱신한다 */
  applyRename(oldName: string, newName: string): void {
    const oldPath = joinPath(this.data.path, oldName);
    const newPath = joinPath(this.data.path, newName);

    this.titleEl.textContent = newName;
    this.data.name = this.data.title = newName;

    // 폴더면 하위 항목들의 path(부모 폴더 경로)도 새 경로로 바꾼다
    const updatePath = (nodes: Node[]) => {
      for (const node of nodes) {
        const path = node.data?.path;
        if (path === oldPath || path?.startsWith(oldPath + '/') || path?.startsWith(oldPath + '\\')) {
          node.data.path = newPath + path.substring(oldPath.length);
        }
        updatePath(node.children);
      }
    };
    updatePath(this.children);

    // 펼침 상태는 이름 경로를 키로 저장하므로 다시 저장한다
    if (this.isDirectory) this.dnd.list.saveTreeViewState();

    // 폴더 먼저, 같은 종류끼리는 이름순 (AppService.readdir 와 같은 규칙) 으로 다시 배치
    const siblings = this.parent ? this.parent.children : this.dnd.list.nodes;
    siblings.splice(siblings.indexOf(this), 1);

    let index = siblings.findIndex(v => {
      if (!v.titleEl) return true; // blank 노드 앞
      if (this.isDirectory !== v.isDirectory) return this.isDirectory;
      return v.titleEl.textContent > newName;
    });
    if (index === -1) index = siblings.length;

    siblings.splice(index, 0, this);
    this.container.insertBefore(this.wrapper, siblings[index+1]?.wrapper ?? null);
  }

  createEdit(data: ListItemElem, level: number = 0,
    onCancel: () => void, onFinish: () => void
  ): void {
    this.id = data.id;
    this.shortenedId = data.id.substring(0, 7);
    this.type = data.type;
    this.isDirectory = data.type === 'folder';
    this.data = data;

    // this.isCollapsed = true;

    const wrapper = this.wrapper = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${4+level*16}px`;

    const content = $('.content');
    const header = $('.ln-header');

    if (data.type == 'folder') {
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
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onFinish();
      }
    }));

    this._register(_addEventListener(input, 'input', (e: KeyboardEvent) => {
      // validate n show message box
      const siblingNames = this.getSiblings().map(v => v.titleEl.textContent);
      showInputMessage(input, validateFileName(input.value, siblingNames));
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

    if (level > 0) {
      if (data.type == 'folder') {
        const at = Array.from(this.container.children).slice(1)[0]
        this.container.insertBefore(wrapper, at || null);
      } else {
        const at = Array.from(this.container.children).slice(1).find((v) => (v as HTMLElement).dataset.type !== 'folder');
        this.container.insertBefore(wrapper, at || null);
      }
    } else {
      if (data.type == 'folder') {
        this.container.insertBefore(wrapper, Array.from(this.container.children)[0] || null);
      } else {
        const at = Array.from(this.container.children).find((v) => (v as HTMLElement).dataset.type !== 'folder');
        this.container.insertBefore(wrapper, at || null);
      }
    }

    input.focus();
  }

  createBlank(): void {
    const wrapper = this.wrapper = $('.wrapper');
    const node = this.node = $('.node.blank');
    const content = $('.content');

    const body = $('.ln-body');
    const listItem = $('.list-item');

    // is anything to do in here?

    body.appendChild(listItem);
    content.appendChild(body);

    node.appendChild(content);
    wrapper.appendChild(node);

    this.container.appendChild(wrapper);
  }
}