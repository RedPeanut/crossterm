import { Layout } from './browser/Layout';

export const enum Parts {
  TITLEBAR_PART = 'workbench.parts.titlebar',
  BANNER_PART = 'workbench.parts.banner',
  ACTIVITYBAR_PART = 'workbench.parts.activitybar',
  SIDEBAR_PART = 'workbench.parts.sidebar',
  PANEL_PART = 'workbench.parts.panel',
  AUXILIARYBAR_PART = 'workbench.parts.auxiliarybar',
  EDITOR_PART = 'workbench.parts.editor',
  STATUSBAR_PART = 'workbench.parts.statusbar'
}

export class MainLayout extends Layout {

  constructor(parent: HTMLElement) { 
    super(parent);
    this.render();
  }

  render(): void {
    // console.log('render() is called ..');
    // create parts
    for (const { id, role, classes } of [
      { id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'] },
      // { id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      // { id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      // { id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
      // { id: Parts.PANEL_PART, role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
      // { id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] }
    ]) {
      const partContainer = this.createPart(id, role, classes);
    }
    this.parent.appendChild(this.mainContainer);

  }

  createPart(id: string, role: string, classes: string[]): HTMLElement {
    return null;
  }

}