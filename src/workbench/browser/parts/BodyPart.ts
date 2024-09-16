import { $ } from '../../../base/browser/dom';
import { SplitView } from '../../../base/browser/ui/SplitView';
import { Part } from '../Part';
import { SessionPart } from './SessionPart';
import { SidebarPart } from './SidebarPart';

export const enum Parts {
  SIDEBAR_PART = 'workbench.parts.sidebar',
  SESSION_PART = 'workbench.parts.session',
}

export interface IBodyPartCreationOptions {}

export class BodyPart extends Part {

  // private element: HTMLElement;
  // private splitview: SplitView;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
  }
  
  override createContentArea(): HTMLElement {
    /* // this.element = $('.content-area');
    for (const { klass, id, role, classes, options } of [
      { klass: SidebarPart, id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      { klass: SessionPart, id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
    ]) {
      const part = new klass(this.mainContainer, id, role, classes, options);
      this.registerPart(part);
      // this.getPart(id).create(this.mainContainer, options);
      this.getPart(id).create();
    }

    const splitview = new SplitView(this.element, null);
    // return splitview; */
    return null;
  }

}