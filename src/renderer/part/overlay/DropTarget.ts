import { TerminalItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";

export interface DropTargetOptions {}

export class DropTarget {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group;

  constructor(parent: HTMLElement, group: Group) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.drop-target');

    return el;
  }

}