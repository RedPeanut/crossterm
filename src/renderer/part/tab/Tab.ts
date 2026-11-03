import { localize } from '../../../common/nls';
import { $, _addEventListener } from '../../util/dom';
import { ConnStatus, TerminalItem } from '../../../common/Types';
import { SessionPartService } from '../SessionPart';
import { getService, sessionPartServiceId } from '../../Service';
import { Disposable } from '../../../common/base/lifecycle';

export class Tab extends Disposable {

  parent: HTMLElement;
  element: HTMLElement;
  statusDot: HTMLElement;

  item: TerminalItem;
  // sessionPartService: SessionPartService;

  constructor(parent: HTMLElement, item: TerminalItem) {
    super();
    this.parent = parent;
    this.item = item;
    // this.sessionPartService = getService(sessionPartServiceId);
  }

  onMouseDown(e: any) {
    (getService(sessionPartServiceId) as SessionPartService).setActiveTerminal(this.item);
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

  onClick_closeBtn(e: any): void {
    e.stopPropagation();
    console.log('closeBtn is clicked...');
  }

  updateStatus(status: ConnStatus): void {
    if (!this.statusDot) return;
    this.statusDot.className = `tab-status-dot status-${status}`;
    this.statusDot.title = this.connStatusLabel(status);
  }

  create(): HTMLElement {
    const item = this.item;

    const el = this.element = $('.tab');
    if (item.selected) el.classList.add('selected');
    if (item.active) el.classList.add('active');

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

    const typeIcon = $(`a.codicon.codicon-${this.item.type === 'local' ? 'terminal' : 'globe'}`);
    this._register(_addEventListener(typeIcon, 'click', (e) => this.onClick_closeBtn(e)));
    el.appendChild(typeIcon);

    // status dot (remote only)
    if (item.type === 'remote') {
      const dot = this.statusDot = $('span.tab-status-dot');
      dot.className = `tab-status-dot status-${item.connStatus ?? 'connecting'}`;
      dot.title = this.connStatusLabel(item.connStatus ?? 'connecting');
      el.appendChild(dot);

      // // register status callback on the item
      item.onConnStatusChange = (status) => this.updateStatus(status);
    }

    const label = $('.label');
    label.textContent = this.item.title; // '탭입니다';
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

