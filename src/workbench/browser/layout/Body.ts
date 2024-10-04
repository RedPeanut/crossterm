import { SplitView, SplitViewItem, VerticalViewItem } from "../../../base/browser/ui/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart } from "../parts/ActivitybarPart";
import { SidebarPart } from "../parts/SidebarPart";
import { SessionPart } from "../parts/SessionPart";
import { Orientation } from "../../../base/browser/ui/sash/Sash";
import { LayoutSizeType, Parts } from "./Workbench";
import { getClientArea } from "../../../base/browser/dom";

export interface BodyOptions {
  sizeType?: LayoutSizeType;
}

export class Body extends Layout implements VerticalViewItem {

  layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
    let dimension = getClientArea(this.mainContainer);
    console.log('dimension =', dimension);
    this.splitView.layout(dimension.width);
  }

  splitView: SplitView;

  constructor(parent: HTMLElement, options: BodyOptions) {
    super(parent);
    if(options) {
      this._sizeType = options.sizeType;
    }
  }

  create(): void {
    this.mainContainer.classList.add(...['body', 'layout']);
    /* for(const { klass, id, role, classes, options } of [
      { klass: SidebarPart, id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      { klass: SessionPart, id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
    ]) {
      const part = new klass(this.mainContainer, id, role, classes, options);
      this.registerPart(part);
      // this.getPart(id).create(this.mainContainer, options);
      this.getPart(id).create();
    } */
    const activitybarPart = new ActivitybarPart(null, Parts.ACTIVITYBAR_PART, 'none', ['activitybar'], null);
    activitybarPart.create();
    const sidebarPart = new SidebarPart(null, Parts.SIDEBAR_PART, 'none', ['sidebar'], null);
    sidebarPart.create();
    const sessionPart = new SessionPart(null, Parts.SESSION_PART, 'none', ['session'], { sizeType: 'fill_parent' });
    sessionPart.create();
    const splitView = this.splitView = new SplitView(this.mainContainer, { orientation: Orientation.HORIZONTAL });
    splitView.addView(activitybarPart);
    splitView.addView(sidebarPart);
    splitView.addView(sessionPart);

    this.parent && this.parent.appendChild(this.mainContainer);
  }

}