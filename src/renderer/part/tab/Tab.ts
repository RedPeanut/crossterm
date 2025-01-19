import { $ } from "../../util/dom";
import { TerminalItem } from "../../../common/Types";
import { SessionPartService } from "../SessionPart";
import { getService, sessionPartServiceId } from "../../Service";

export class Tab {
  parent: HTMLElement;
  element: HTMLElement;
  item: TerminalItem;
  sessionPartService: SessionPartService;

  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
    this.item = item;
    // this.sessionPartService = getService(sessionPartServiceId);
  }

  onDragStart(e: any): void {
    console.log('onDragStart event is called...');
    // console.log('e =', e);
    this.sessionPartService && this.sessionPartService.makeOverlayVisible(true);
  }
  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {}
  onDragEnd(e: any): void {
    console.log('onDragEnd event is called...');
    this.sessionPartService && this.sessionPartService.makeOverlayVisible(false);
  }
  onDragOver(e: any): void {}
  onDrop(e: any): void {}

  create(): HTMLElement {
    const item = this.item;

    const el = this.element = $('.tab');
    if(item.selected) el.classList.add('selected');
    if(item.active) el.classList.add('active');
    el.style.setProperty('--tab-border-bottom-color', 'rgb(31, 31, 31)');
    el.style.setProperty('--tab-border-top-color', 'rgb(0, 120, 212)');

    el.draggable = true;
    el.ondragstart = this.onDragStart.bind(this);
    el.ondragenter = this.onDragEnter.bind(this);
    el.ondragleave = this.onDragLeave.bind(this);
    el.ondragend = this.onDragEnd.bind(this);
    el.ondragover = this.onDragOver.bind(this);
    el.ondrop = this.onDrop.bind(this);

    const tabBorderTopContainer = $('.tab-border-top-container');
    el.appendChild(tabBorderTopContainer);
    const label = $('.label');
    label.innerText = '탭입니다';
    el.appendChild(label);
    const tabActionsContainer = $('.tab-actions');
    el.appendChild(tabActionsContainer);
    const tabBorderBottomContainer = $('.tab-border-bottom-container');
    el.appendChild(tabBorderBottomContainer);
    return el;
  }

  getServices(): void {
    // console.log('getServices() is called ...');
    this.sessionPartService = getService(sessionPartServiceId);
  }

}