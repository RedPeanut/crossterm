import { coalesce } from '../../base/common/arrays';
import { isLinux, isWindows } from '../../base/common/platform';
import { Layout } from './Layout';
import { IPartOptions, Part } from './Part';
import { TitlebarPart } from './parts/titlebar/TitlebarPart';
import { ActivitybarPart } from './parts/activitybar/ActivitybarPart';
import { BodyPart } from './parts/body/BodyPart';
import { StatusbarPart } from './parts/statusbar/StatusbarPart';
import { Body } from './Body';
import { SplitView } from '../../base/browser/ui/SplitView';
import { getClientArea, position, size } from '../../base/browser/dom';
// import Runtime from './Runtime';

export const enum Parts {
  TITLEBAR_PART = 'workbench.parts.titlebar',
  // BANNER_PART = 'workbench.parts.banner',
  // ACTIVITYBAR_PART = 'workbench.parts.activitybar',
  // SIDEBAR_PART = 'workbench.parts.sidebar',
  // PANEL_PART = 'workbench.parts.panel',
  // AUXILIARYBAR_PART = 'workbench.parts.auxiliarybar',
  // EDITOR_PART = 'workbench.parts.editor',
  // SESSION_PART = 'workbench.parts.session',
  BODY_PART = 'workbench.parts.body',
  STATUSBAR_PART = 'workbench.parts.statusbar'
}

export class Workbench extends Layout {

  constructor(parent: HTMLElement) { 
    super(parent);
  }

  create(): void {
    // console.log('render() is called ..');

    //
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac'; //Runtime.isWindows ? 'windows' : Runtime.isLinux ? 'linux' : 'mac';
    const workbenchClasses = coalesce(['workbench', platformClass]);
    this.mainContainer.classList.add(...workbenchClasses);

    /* // create parts
    for (const { klass, id, role, classes, options } of [
      { klass: TitlebarPart, id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'], options: {} },
      { klass: ActivitybarPart, id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar'], options: {} },
      // { id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      // { id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
      // { id: Parts.PANEL_PART, role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
      { klass: BodyPart, id: Parts.BODY_PART, role: 'none', classes: ['body'], options: {} },
      { klass: StatusbarPart, id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] }
    ]) {
      // const part = this.createPart(klass, id, role, classes, options);
      const part = new klass(this.mainContainer, id, role, classes, options);
      this.registerPart(part);
      // this.getPart(id).create(this.mainContainer, options);
      this.getPart(id).create();
    } */

    const titlebarPart = new TitlebarPart(this.mainContainer, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();

    const body = new Body(this.mainContainer);
    body.create();

    const statusbarPart = new StatusbarPart(this.mainContainer, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    /* const splitView = this.splitView = new SplitView(this.mainContainer, {});
    splitView.addView(titlebarPart);
    splitView.addView(body);
    splitView.addView(statusbarPart); */
    
    this.parent.appendChild(this.mainContainer);
  }

  /* createPart<T extends Part>(
      // https://stackoverflow.com/questions/24677592/generic-type-inference-with-class-argument/26696435#26696435
      // According to the language spec, need to refer to the class type by it's ctor fn.
      klass: { new(id: string, role: string, classes: string[], options: object): T; },
      id: string, 
      role: string, 
      classes: string[], 
      options: {}
  ): Part {
    const part = new klass(id, role, classes, options);
    return part;
  } */

  /* createPart(id: string, role: string, classes: string[]): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', ...classes);
    part.id = id;
		part.setAttribute('role', role);
    return part;
  } */

}