import { coalesce } from '../../base/common/arrays';
import { isLinux, isWindows } from '../../base/common/platform';
import { Layout } from './Layout';
import { IPartOptions, Part } from './Part';
// import Runtime from './Runtime';
import { TitlebarPart } from './parts/titlebar/TitlebarPart';

export const enum Parts {
  TITLEBAR_PART = 'workbench.parts.titlebar',
  BANNER_PART = 'workbench.parts.banner',
  ACTIVITYBAR_PART = 'workbench.parts.activitybar',
  SIDEBAR_PART = 'workbench.parts.sidebar',
  PANEL_PART = 'workbench.parts.panel',
  AUXILIARYBAR_PART = 'workbench.parts.auxiliarybar',
  // EDITOR_PART = 'workbench.parts.editor',
  SESSION_PART = 'workbench.parts.session',
  STATUSBAR_PART = 'workbench.parts.statusbar'
}

export class Workbench extends Layout {

  constructor(parent: HTMLElement) { 
    super(parent);
    this.render();
  }

  render(): void {
    // console.log('render() is called ..');

    //
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac'; //Runtime.isWindows ? 'windows' : Runtime.isLinux ? 'linux' : 'mac';
    const workbenchClasses = coalesce(['workbench', platformClass]);
    this.mainContainer.classList.add(...workbenchClasses);

    // create parts
    for (const { klass, id, role, classes, options } of [
      { klass: TitlebarPart, id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'], options: {} },
      // { id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      // { id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      // { id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
      // { id: Parts.PANEL_PART, role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
      // { id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] }
    ]) {
      const part = this.createPart(klass, id, role, classes, options);
      this.registerPart(part);
      this.getPart(id).create(this.mainContainer, options);
    }
    this.parent.appendChild(this.mainContainer);
  }

  createPart<T extends Part>(
      // https://stackoverflow.com/questions/24677592/generic-type-inference-with-class-argument/26696435#26696435
      // According to the language spec, need to refer to the class type by it's ctor fn.
      klass: { new(id: string, options: IPartOptions): T; },
      id: string, 
      role: string, 
      classes: string[], 
      options: {}
  ): Part {
    const part = new klass(id, null);
    return part;
  }

  /* createPart(id: string, role: string, classes: string[]): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', ...classes);
    part.id = id;
		part.setAttribute('role', role);
    return part;
  } */

}