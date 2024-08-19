import { SplitView, SplitViewItem } from "../../base/browser/ui/SplitView";
import { Layout } from "./Layout";
import { ActivitybarPart } from "./parts/activitybar/ActivitybarPart";
import { SidebarPart } from "./parts/sidebar/SidebarPart";
import { SessionPart } from "./parts/session/SessionPart";

export const enum Parts {
	ACTIVITYBAR_PART = 'workbench.parts.activitybar',
  SIDEBAR_PART = 'workbench.parts.sidebar',
  SESSION_PART = 'workbench.parts.session',
}

export class Body extends Layout {

  constructor(parent: HTMLElement) { 
    super(parent);
  }

  create(): void {
    this.mainContainer.classList.add(...['body']);
    /* for(const { klass, id, role, classes, options } of [
      { klass: SidebarPart, id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      { klass: SessionPart, id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
    ]) {
      const part = new klass(this.mainContainer, id, role, classes, options);
      this.registerPart(part);
      // this.getPart(id).create(this.mainContainer, options);
      this.getPart(id).create();
    } */
    const activitybarPart = new ActivitybarPart(this.mainContainer, Parts.ACTIVITYBAR_PART, 'none', ['activitybar'], null);
    activitybarPart.create();
		// let accessor = new SplitViewItem();
		// activitybarPart.accessor = new SplitViewItem() {
		// 	layoutContainer(offset: number) {}
		// };

    const sidebarPart = new SidebarPart(this.mainContainer, Parts.SIDEBAR_PART, 'none', ['sidebar'], null);
    sidebarPart.create();
    const sessionPart = new SessionPart(this.mainContainer, Parts.SESSION_PART, 'none', ['session'], null);
    sessionPart.create();
    /* const splitView = new SplitView(this.mainContainer, {});
		splitView.addView(activitybarPart);
    splitView.addView(sidebarPart);
    splitView.addView(sessionPart); */

    this.parent.appendChild(this.mainContainer);
  }

}