import { TerminalItem } from "../../../../Types";
import { $ } from "../../../../base/browser/dom";
import _, { DebouncedFunc } from 'lodash';
import { DropTarget } from "./DropTarget";

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

export interface DropOverlayOptions {}

export class DropOverlay {
  
  parent: HTMLElement;
  element: HTMLElement;
  group: TerminalItem[];
  target: DropTarget;

  splitDirection: GroupDirection | undefined;
  throttle_doPositionOverlay: DebouncedFunc<(...args: any[]) => any>;

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

}