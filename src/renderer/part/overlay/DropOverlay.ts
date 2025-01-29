import { TerminalItem } from "../../../common/Types";
import { $ } from "../../util/dom";
import _, { DebouncedFunc } from 'lodash';
import { DropTarget } from "./DropTarget";
import { bodyLayoutServiceId, getService, sessionPartServiceId } from "../../Service";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { SessionPartService } from "../SessionPart";
import { wrapper } from "../../../globals";
import { cleanSingleSplitItemOnce, findActiveItem, findItemById, findSplitItemByGroup } from "../../utils";
import { Group, Mode, SplitItem } from "../../Types";

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

export interface DropOverlayOptions {}

export class DropOverlay {

  parent: HTMLElement;
  element: HTMLElement;
  group: TerminalItem[];
  target: DropTarget;

  //
  throttle_doPositionOverlay: DebouncedFunc<(...args: any[]) => any>;
  splitDirection: GroupDirection | undefined;

  sessionPartService: SessionPartService;
  bodyLayoutService: BodyLayoutService;

  constructor(parent: HTMLElement, group: TerminalItem[], target: DropTarget) {
    this.parent = parent;
    this.group = group;
    this.target = target;
    this.throttle_doPositionOverlay = _.throttle(this.doPositionOverlay.bind(this), 300, {trailing:false});
  }

  doPositionOverlay(e: any): void {
    // console.log('doPositionOverlay() is called..');
    let style: { top: string; left: string; width: string; height: string };

    const clientWidth = this.element.clientWidth;
    const clientHeight = this.element.clientHeight;

    let mousePosX = e.offsetX;
    let mousePosY = e.offsetY;

    // console.log('{clientWidth, clientHeight} =', {clientWidth, clientHeight});

    let edgeWidthThresholdFactor: number = 0.2; // 20% threshold to split
    let edgeHeightThresholdFactor: number = 0.2; // 20% threshold to split

    const edgeWidthThreshold = clientWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = clientHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = clientWidth / 3; // offer to split left/right at 33%
    const splitHeightThreshold = clientHeight / 3; // offer to split up/down at 33%

    // No split if mouse is above certain threshold in the center of the view
    // this.splitDirection = undefined;
    if(
      mousePosX > edgeWidthThreshold && mousePosX < clientWidth - edgeWidthThreshold &&
      mousePosY > edgeHeightThreshold && mousePosY < clientHeight - edgeHeightThreshold
    ) {
      this.splitDirection = undefined;
    }

    // Offer to split otherwise
    else {

      // prefers to split vertically: offer a larger hitzone
      // for this direction like so:
      // ------------------------------------
      // |         |  SPLIT UP    |         |
      // |  SPLIT  |--------------|  SPLIT  |
      // |         |    MERGE     |         |
      // |  LEFT   |--------------|  RIGHT  |
      // |         |  SPLIT DOWN  |         |
      // ------------------------------------
      if(mousePosX < splitWidthThreshold) {
        this.splitDirection = GroupDirection.LEFT;
      } else if(mousePosX > splitWidthThreshold * 2) {
        this.splitDirection = GroupDirection.RIGHT;
      } else if(mousePosY < clientHeight / 2) {
        this.splitDirection = GroupDirection.UP;
      } else {
        this.splitDirection = GroupDirection.DOWN;
      }
    }

    // Draw overlay based on split direction
    switch(this.splitDirection) {
      case GroupDirection.UP:
        style = { top: '0', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.DOWN:
        style = { top: '50%', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.LEFT:
        style = { top: '0', left: '0', width: '50%', height: '100%' };
        break;
      case GroupDirection.RIGHT:
        style = { top: '0', left: '50%', width: '50%', height: '100%' };
        break;
      default:
        style = { top: '0', left: '0', width: '100%', height: '100%' };
    }

    this.target.element.style.top = style.top;
    this.target.element.style.left = style.left;
    this.target.element.style.width = style.width;
    this.target.element.style.height = style.height;

    // Make sure the overlay is visible now
    this.target.element.style.opacity = '1';
  }

  onDragStart(e: any): void {}
  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {
    this.target.element.style.opacity = '0';
  }
  onDragEnd(e: any): void {}
  onDragOver(e: any): void {
    // console.log('onDragOver event is called...');
    e.preventDefault();
    this.throttle_doPositionOverlay(e);
  }

  onDrop(e: any): void {
    // console.log('onDrop event is called...');
    e.preventDefault();
    this.target.element.style.opacity = '0';

    const drag_id = e.dataTransfer.getData('text/plain');

    // find drag item
    const find_drag = findItemById(wrapper.tree, 0, [], drag_id);
    console.log('find_drag =', find_drag);
    const { depth: drag_depth, index: drag_index, pos: drag_pos, item: drag_item, group: drag_group, splitItem: drag_splitItem } = find_drag;

    // find splitItem by curr group ref
    const find_curr = findSplitItemByGroup(wrapper.tree, 0, [], this.group);
    console.log('find_curr =', find_curr);
    const { depth: curr_depth, index: curr_index, group: curr_group, splitItem: curr_splitItem } = find_curr;

    if(this.splitDirection !== GroupDirection.UP
      && this.splitDirection !== GroupDirection.DOWN
      && this.splitDirection !== GroupDirection.LEFT
      && this.splitDirection !== GroupDirection.RIGHT
    ) {
      if(curr_group === drag_group) {
        // nothing do
        return;
      } else {
        /* 예)
        {
          mode: 'horizontal',
          list:[
            [{a1},{a2}],
            [{b1}]
          ]
        }
        -> drop b1 to a2
        {
          mode: 'horizontal',
          list:[
            [{a1},{a2},{b1}]
          ]
        }
        */

        if(drag_group.length > 1) {
          drag_group.splice(drag_pos, 1);
          drag_group[drag_group.length-1].selected = true;
        } else
          drag_splitItem.list.splice(drag_index[drag_index.length-1], 1);
        curr_group.push(drag_item);
      }
    } else {

      if(curr_group.length === 1) {
        // nothing do
        return;
      }

      const mode: Mode = this.splitDirection === GroupDirection.UP
        || this.splitDirection === GroupDirection.DOWN ? 'vertical' : 'horizontal';

      if(curr_group === drag_group) {
        // let new_group: Group = [];
        curr_group.splice(drag_pos, 1)[0];
        curr_group[curr_group.length-1].selected = true;

        let new_split: SplitItem = { mode: mode, list: []};
        if(this.splitDirection === GroupDirection.UP || this.splitDirection === GroupDirection.LEFT) {
          new_split.list.push([drag_item]);
          new_split.list.push(curr_group);
        } else {
          new_split.list.push(curr_group);
          new_split.list.push([drag_item]);
        }

        // replace
        let new_list: (SplitItem | Group)[] = [];
        // curr_index[curr_index.length-1] : 현재 떨구려는 리스트의 인덱스
        const curr_drop_index = curr_index[curr_index.length-1];
        if(0 < curr_drop_index) {
          for(let i = 0; i <= curr_drop_index-1; i++)
            new_list.push(curr_splitItem.list[i])
        }
        new_list.push(new_split);
        if(curr_drop_index < curr_splitItem.list.length-1) {
          for(let i = curr_drop_index+1; i <= curr_splitItem.list.length-1; i++)
            new_list.push(curr_splitItem.list[i]);
        }
        curr_splitItem.list = new_list;
      } else {
        let new_split: SplitItem = { mode: mode, list: []};
        if(this.splitDirection === GroupDirection.UP || this.splitDirection === GroupDirection.LEFT) {
          new_split.list.push([drag_item]);
          new_split.list.push(curr_group);
        } else {
          new_split.list.push(curr_group);
          new_split.list.push([drag_item]);
        }

        // replace
        let new_list: (SplitItem | Group)[] = [];
        // curr_index[curr_index.length-1] : 현재 떨구려는 리스트의 인덱스
        const curr_drop_index = curr_index[curr_index.length-1];
        if(0 < curr_drop_index) {
          for(let i = 0; i <= curr_drop_index-1; i++)
            new_list.push(curr_splitItem.list[i])
        }
        new_list.push(new_split);
        if(curr_drop_index < curr_splitItem.list.length-1) {
          for(let i = curr_drop_index+1; i <= curr_splitItem.list.length-1; i++)
            new_list.push(curr_splitItem.list[i]);
        }
        curr_splitItem.list = new_list;

        // remove
        if(drag_group.length > 1)
          drag_group.splice(drag_pos, 1);
        else {
          // drag_group = null; // constant error
          // drag_splitItem.list[drag_index[drag_index.length-1]] = null;
          drag_splitItem.list.splice(drag_index[drag_index.length-1], 1)[0]
        }
      }
    }

    cleanSingleSplitItemOnce(wrapper.tree);
    console.log('wrapper.tree =', wrapper.tree);
    this.bodyLayoutService.recreate();
    this.bodyLayoutService.layout(0, 0); // not use param

    const sessionPartService = getService(sessionPartServiceId)
    sessionPartService.getServices(); // reconnect service
    sessionPartService.fit(); // fit again
  }

  create(): HTMLElement {
    const el = this.element = $('.drop-overlay');
    el.ondragstart = this.onDragStart.bind(this);
    el.ondragenter = this.onDragEnter.bind(this);
    el.ondragleave = this.onDragLeave.bind(this);
    el.ondragend = this.onDragEnd.bind(this);
    el.ondragover = this.onDragOver.bind(this);
    el.ondrop = this.onDrop.bind(this);
    return el;
  }

  getServices(): void {
    this.sessionPartService = getService(sessionPartServiceId);
    this.bodyLayoutService = getService(bodyLayoutServiceId);
  }
}