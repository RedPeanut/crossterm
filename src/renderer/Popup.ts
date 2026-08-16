import { Emitter, Event } from "../common/base/event";
import { Disposable } from "../common/base/lifecycle";
import { $, _addEventListener } from "./util/dom";
import * as dom from "./util/dom";

export interface PopupOptions {
  classList?: string[];
}

export abstract class Popup extends Disposable {

  readonly options: PopupOptions;

  // parent: HTMLElement;
  container: HTMLElement;
  popup: HTMLElement;
  titleArea: HTMLElement;
  title: HTMLElement;
  contentArea: HTMLElement;

  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;

  // private readonly _onDidXxx = this._register(new Emitter<XxxEvent>());
  // public onDidXxx/* : Event<XxxEvent> */ = this._onDidXxx.event;

  constructor(parent: HTMLElement, options: PopupOptions = {}) {
    super();
    // const _parent = parent ?? document.body;
    const container = this.container = $('.popup-container');
    container.style.display = 'none';

    this.options = options;
    options && options.classList && container.classList.add(...options.classList);

    const popup = this.popup = $('.popup');
    popup.tabIndex = -1;

    this.renderTitleArea();
    this.renderContentArea();
    container.appendChild(popup);

    this._register(_addEventListener(container, 'mousedown', (e: MouseEvent) => {
      if(e.target === container)
        this.cancel();
    }));

    this._register(_addEventListener(popup, 'keydown', (e: KeyboardEvent) => {

      e.stopPropagation();
      e.preventDefault();

      if(e.key === 'Escape') {
        this.cancel();
      } else if(e.key === 'Enter') {
        this.ok();
      }
    }));

    parent.appendChild(container);
  }

  onDragStart(e: MouseEvent) {
    if (e.target !== this.titleArea) return;

    this.isDragging = true;
    // 팝업의 현재 위치와 마우스 위치 차이 저장
    const rect = this.popup.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;
    // 팝업을 absolute로
    this.popup.style.position = 'fixed';
  }

  onDragMove(e: MouseEvent) {
    if (!this.isDragging) return;
    // 팝업 위치 갱신
    this.popup.style.left = `${e.clientX - this.dragOffsetX}px`;
    this.popup.style.top = `${e.clientY - this.dragOffsetY}px`;
  }

  onDragEnd(e: MouseEvent) {
    this.isDragging = false;
  }

  show(): void {
    this.container.style.display = 'flex';
    this.popup.focus();
  }

  ok(): void {
    this.close();
  }

  cancel(): void {
    this.close();
  }

  close(): void {
    // this.container.style.display = 'none';
    this.container?.remove();
    this.container = null;
    this.dispose();
  }

  renderTitleArea(): void {
    const titleArea = this.titleArea = $('.title-area');

    const onDragStart = (e: MouseEvent) => this.onDragStart(e);
    const onDragMove = (e: MouseEvent) => this.onDragMove(e);
    const onDragEnd = (e: MouseEvent) => this.onDragEnd(e);

    this._register(_addEventListener(titleArea, 'mousedown', onDragStart));
    this._register(_addEventListener(document, 'mousemove', onDragMove));
    this._register(_addEventListener(document, 'mouseup', onDragEnd));

    const title = this.title = $('span.title');
    this.title.innerHTML = 'should replace title';
    titleArea.appendChild(title);
    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    // closeBtn.addEventListener('click', () => { this.close(); });
    this._register(_addEventListener(closeBtn, 'click', () => this.cancel()));
    titleArea.appendChild(closeBtn);
    this.popup.appendChild(titleArea);
  }

  renderContentArea(): void {
    const contentArea = this.contentArea = $('.content-area');
    this.popup.appendChild(contentArea);
  }
}