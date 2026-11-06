// import { RenderTerminalItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import { Disposable } from '../../../common/base/lifecycle';

export interface DropTargetOptions {}

export class DropTarget extends Disposable {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group;

  constructor(parent: HTMLElement, group: Group) {
    super();
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.drop-target');

    return el;
  }

}