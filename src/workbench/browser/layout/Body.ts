import { SplitView, SplitViewItem, VerticalViewItem } from "../../../base/browser/ui/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart } from "../parts/ActivitybarPart";
import { SidebarPart } from "../parts/SidebarPart";
import { SessionPart } from "../parts/SessionPart";
import { Orientation } from "../../../base/browser/ui/sash/Sash";

export const enum Parts {
  ACTIVITYBAR_PART = 'workbench.part.activitybar',
  SIDEBAR_PART = 'workbench.part.sidebar',
  SESSION_PART = 'workbench.part.session',
}

export class Body extends Layout implements VerticalViewItem {

  layoutContainer(offset: number): void {
    this.splitViewContainer.style.top = `${offset}px`;
    this.splitViewContainer.style.height = `${this.size}px`;
  }

  constructor(parent: HTMLElement) { 
    super(parent);
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
    // let accessor = new SplitViewItem();
    // activitybarPart.accessor = new SplitViewItem() {
    //   layoutContainer(offset: number) {}
    // };

    const sidebarPart = new SidebarPart(null, Parts.SIDEBAR_PART, 'none', ['sidebar'], null);
    sidebarPart.create();
    const sessionPart = new SessionPart(null, Parts.SESSION_PART, 'none', ['session'], null);
    sessionPart.create();
    const splitView = new SplitView(this.mainContainer, { orientation: Orientation.HORIZONTAL });
    splitView.addView(activitybarPart);
    splitView.addView(sidebarPart);
    splitView.addView(sessionPart);

    this.parent && this.parent.appendChild(this.mainContainer);
  }

}