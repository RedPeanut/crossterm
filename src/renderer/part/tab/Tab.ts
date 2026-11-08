import { localize } from '../../../common/nls';
import { $, _addEventListener } from '../../util/dom';
// import { ConnStatus, RenderTerminalItem } from '../../../common/Types';
import { ConnStatus, RenderTerminalItem, TabItem } from '../../Types';
import { SessionPartService } from '../SessionPart';
import { bodyLayoutServiceId, getService, sessionPartServiceId } from '../../Service';
import { Disposable } from '../../../common/base/lifecycle';
import { BodyLayoutService } from '../../layout/BodyLayout';
import { wrapper } from '../../globals';
import { cleanSingleSplitItemOnce, collectVisibleItems, findItemById } from '../../utils';
import { isSplitItem, SplitItem } from '../../Types';
import { Term } from '../content/Term';

export class Tab extends Disposable {

  parent: HTMLElement;
  element: HTMLElement;
  statusDot: HTMLElement;

  // item: RenderTerminalItem;
  item: TabItem;
  // sessionPartService: SessionPartService;

  constructor(parent: HTMLElement, item: TabItem) {
    super();
    this.parent = parent;
    this.item = item;
    // this.sessionPartService = getService(sessionPartServiceId);
  }

  onMouseDown(e: any) {
    (getService(sessionPartServiceId) as SessionPartService).setActiveTab(this.item);
  }

  onDragStart(e: any): void {
    console.log('onDragStart event is called...');
    // console.log('e =', e);
    e.dataTransfer.setData('text', this.item.uid);
    (getService(sessionPartServiceId) as SessionPartService).makeOverlayVisible(true);
  }

  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {}

  onDragEnd(e: any): void {
    console.log('onDragEnd event is called...');
    (getService(sessionPartServiceId) as SessionPartService).makeOverlayVisible(false);
  }

  onDragOver(e: any): void {}
  onDrop(e: any): void {}

  /**
   * 탭(터미널)을 닫는다.
   * 트리에서 항목을 빼고, 빠진 자리의 selected/active를 이웃에게 넘긴 뒤 SessionPart를 다시 만든다.
   */
  onClick_closeBtn(e: any): void {
    e.stopPropagation();

    const item = this.item;

    const find_curr = findItemById(wrapper.tree, 0, [], item.uid);
    if (!find_curr) return;

    const { index, pos, group, splitItem } = find_curr;

    const view = item.view;

    // 터미널 정리: main의 pty/ssh 종료 + renderer 쪽 xterm/리스너 해제
    // (Term.uid는 item.uid와 별개이며, main은 Term.uid로 터미널을 관리한다)
    if (item.kind === 'terminal') {
      window.ipc.send('terminal close', { uid: (view as Term).uid });
    }
    view.dispose();
    view.element.remove();
    item.view = undefined;

    // find this in wrapper n remove
    let next: TabItem | undefined;
    if (group.length > 1) {
      group.splice(pos, 1);
      // 같은 그룹에 남은 탭이 있으면 오른쪽(없으면 왼쪽) 탭이 이어받는다.
      next = group[Math.min(pos, group.length - 1)];
      if (item.selected) next.selected = true;
    } else {
      splitItem.list.splice(index[index.length - 1], 1);
    }

    if (wrapper.tree.list.length === 1) {
      if (isSplitItem(wrapper.tree.list[0]))
        wrapper.tree = wrapper.tree.list[0] as SplitItem;
    } else
      cleanSingleSplitItemOnce(wrapper.tree);

    // 닫은 탭이 active였다면 새 active를 정한다. 그룹째 사라졌으면 화면에 보이는 첫 터미널로 넘긴다.
    if (item.active) {
      if (!next) next = collectVisibleItems(wrapper.tree)[0];
      if (next) {
        next.selected = true;
        next.active = true;
      }
    } else
      next = undefined;

    // body layout recreate
    const bodyLayoutService: BodyLayoutService = getService(bodyLayoutServiceId);
    const sessionPartService: SessionPartService = getService(sessionPartServiceId);
    bodyLayoutService.recreate();
    bodyLayoutService.layout(0, 0); // not use param
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sessionPartService.fit();

      // next?.view?.updateStatusbar();
      if (next) {
        if (next.kind === 'terminal')
          next.view?.updateStatusbar();
      }
    }));
  }

  updateStatus(status: ConnStatus): void {
    if (!this.statusDot) return;
    this.statusDot.className = `tab-status-dot status-${status}`;
    this.statusDot.title = this.connStatusLabel(status);
  }

  create(): HTMLElement {
    // const item = this.item;

    const el = this.element = $('.tab');
    if (this.item.selected) el.classList.add('selected');
    if (this.item.active) el.classList.add('active');

    el.draggable = true;
    // el.onmousedown = this.onMouseDown.bind(this);
    // el.ondragstart = this.onDragStart.bind(this);
    // el.ondragenter = this.onDragEnter.bind(this);
    // el.ondragleave = this.onDragLeave.bind(this);
    // el.ondragend = this.onDragEnd.bind(this);
    // el.ondragover = this.onDragOver.bind(this);
    // el.ondrop = this.onDrop.bind(this);

    // this._register(_addEventListener(el, 'mousedown', this.onMouseDown)); // x
    // this._register(_addEventListener(el, 'mousedown', this.onMouseDown.bind(this))); // ?
    // this._register(_addEventListener(el, 'mousedown', () => this.onMouseDown)); // ?
    this._register(_addEventListener(el, 'mousedown', (e) => this.onMouseDown(e))); // o
    this._register(_addEventListener(el, 'dragstart', (e) => this.onDragStart(e)));
    this._register(_addEventListener(el, 'dragenter', (e) => this.onDragEnter(e)));
    this._register(_addEventListener(el, 'dragleave', (e) => this.onDragLeave(e)));
    this._register(_addEventListener(el, 'dragend', (e) => this.onDragEnd(e)));
    this._register(_addEventListener(el, 'dragover', (e) => this.onDragOver(e)));
    this._register(_addEventListener(el, 'drop', (e) => this.onDrop(e)));

    const tabBorderTopContainer = $('.tab-border-top-container');
    el.appendChild(tabBorderTopContainer);

    let typeIcon: HTMLElement;
    if (this.item.kind === 'settings') {
      typeIcon = $(`a.codicon.codicon-settings`);
    } else if (this.item.kind === 'shortcuts') {
      typeIcon = $(`a.codicon.codicon-keyboard`); // record-keys
    } else { // if (this.item.kind === 'terminal') {
      typeIcon = $(`a.codicon.codicon-${this.item.type === 'local' ? 'terminal' : 'globe'}`);
    }
    this._register(_addEventListener(typeIcon, 'click', (e) => this.onClick_closeBtn(e)));
    el.appendChild(typeIcon);

    if (this.item.kind === 'terminal') {
      // status dot (remote only)
      if (this.item.type === 'remote') {
        const dot = this.statusDot = $('span.tab-status-dot');
        dot.className = `tab-status-dot status-${this.item.connStatus ?? 'connecting'}`;
        dot.title = this.connStatusLabel(this.item.connStatus ?? 'connecting');
        el.appendChild(dot);

        // // register status callback on the item
        this.item.onConnStatusChange = (status) => this.updateStatus(status);
      }
    }

    const label = $('.label');
    let title: string;
    if (this.item.kind === 'settings') {
      title = localize('tab.title.settings', 'Settings');
    } else if (this.item.kind === 'shortcuts') {
      title = localize('tab.title.shortcuts', 'Keyboard Shortcuts');
    } else { // if (this.item.kind === 'terminal') {
      title = this.item.title; // '탭입니다';
    }
    label.textContent = title;
    el.appendChild(label);

    /* const tabActionsContainer = $('.tab-actions');
    const actionsContainer = $('.actions-container');
    const closeBtn = $('a.codicon.codicon-close');
    closeBtn.onclick = this.onClick_closeBtn.bind(this);
    actionsContainer.appendChild(closeBtn);
    tabActionsContainer.appendChild(actionsContainer);
    el.appendChild(tabActionsContainer); */

    const tabBorderBottomContainer = $('.tab-border-bottom-container');
    el.appendChild(tabBorderBottomContainer);

    return el;
  }

  getServices(): void {
    // console.log('getServices() is called ...');
    // this.sessionPartService = getService(sessionPartServiceId);
  }

  /** 상태 점(status dot) 툴팁에 보여줄 문구 */
  connStatusLabel(status: ConnStatus): string {
    switch (status) {
      case 'connecting': return localize('tab.status.connecting', 'Connecting');
      case 'connected': return localize('tab.status.connected', 'Connected');
      case 'error': return localize('tab.status.error', 'Error');
      case 'closed': return localize('tab.status.closed', 'Closed');
      default: return status;
    }
  }
}

