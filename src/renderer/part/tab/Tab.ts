import { $ } from "../../util/dom";
import { TerminalItem } from "../../../common/Types";
import { SessionPartService } from "../SessionPart";
import { getService, sessionPartServiceId } from "../../Service";
import { tree } from "../../../globals";
import { findActiveItem, findItemById } from "../../utils";

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

  onMouseDown(e: any) {

    const currItem = this.item;

    // find active item index
    const find_active = findActiveItem(tree, 0, []);

    if(find_active) {
      const { depth, index, pos, item: activeItem, group } = find_active;

      // turn off active item's selected property if current is in same group
      let same_group = false;
      for(let i = 0; i < group.length; i++) {
        if(group[i].uid === currItem.uid) {
          same_group = true;
          break;
        }
      }

      if(same_group) activeItem.selected = false;
      activeItem.active = false;

      // console.log('find_active =', find_active);
      this.sessionPartService.controlTabStyle({depth, index, pos}, {selected: same_group ? false : activeItem.selected, active: false});

      const find_curr = findItemById(tree, 0, [], currItem.uid);
      if(find_curr) {
        if(same_group) currItem.selected = true;
        currItem.active = true;

        const { depth, index, pos } = find_curr;
        // console.log('find_curr =', find_curr);
        this.sessionPartService.controlTabStyle({depth, index, pos}, {selected: same_group ? true : currItem.selected, active: true});
      }
    }
  }

  onDragStart(e: any): void {
    console.log('onDragStart event is called...');
    // console.log('e =', e);
    this.sessionPartService.makeOverlayVisible(true);
  }

  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {}

  onDragEnd(e: any): void {
    console.log('onDragEnd event is called...');
    this.sessionPartService.makeOverlayVisible(false);
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
    el.onmousedown = this.onMouseDown.bind(this);
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