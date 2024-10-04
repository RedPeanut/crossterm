import { coalesce } from '../../../base/common/arrays';
import { isLinux, isWindows } from '../../../base/common/platform';
import { Layout } from '../Layout';
import { PartOptions, Part } from '../Part';
import { TitlebarPart } from '../parts/TitlebarPart';
import { ActivitybarPart } from '../parts/ActivitybarPart';
// import { BodyPart } from '../parts/BodyPart';
import { StatusbarPart } from '../parts/StatusbarPart';
import { Body } from './Body';
import { SplitView, SplitViewItem } from '../../../base/browser/ui/SplitView';
import { getClientArea, position, size } from '../../../base/browser/dom';
import { Orientation } from '../../../base/browser/ui/sash/Sash';
// import Runtime from './Runtime';

export type LayoutSizeType = 'match_parent' | 'fill_parent' | 'wrap_content';

export const TITLEBAR_HEIGHT = 42;
export const ACTIVITYBAR_WIDTH = 48;
export const SIDEBAR_WIDTH = 220;
// export const SESSION_WIDTH = 'fill_parent';
export const STATUSBAR_HEIGHT = 22;

export const enum Parts {
  TITLEBAR_PART = 'workbench.part.titlebar',
  ACTIVITYBAR_PART = 'workbench.part.activitybar',
  SIDEBAR_PART = 'workbench.part.sidebar',
  SESSION_PART = 'workbench.part.session',
  BODY_PART = 'workbench.part.body',
  STATUSBAR_PART = 'workbench.part.statusbar'
}

export class Workbench extends Layout {

  layoutContainer(offset: number): void {
    throw new Error('Method not implemented.');
  }

  splitView: SplitView;

  constructor(parent: HTMLElement) { 
    super(parent);
  }

  create(): void {
    // console.log('render() is called ..');

    //
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac'; //Runtime.isWindows ? 'windows' : Runtime.isLinux ? 'linux' : 'mac';
    const workbenchClasses = coalesce(['workbench', platformClass]);
    this.mainContainer.classList.add(...workbenchClasses);

    const titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();
    
    const body = new Body(null, { sizeType: 'fill_parent' });
    body.create();

    const statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    const splitView = this.splitView = new SplitView(this.mainContainer, { orientation: Orientation.VERTICAL });
    splitView.addView(titlebarPart);
    splitView.addView(body);
    splitView.addView(statusbarPart);
    
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

  layout(): void {
    let dimension = getClientArea(this.parent);
    console.log('dimension =', dimension);
    position(this.mainContainer, 0, 0, 0, 0, 'relative');
    size(this.mainContainer, dimension.width, dimension.height);
    if(this.splitView.orientation === Orientation.HORIZONTAL)
      this.splitView.layout(dimension.width);
    else
      this.splitView.layout(dimension.height);
  }

  startup(): void {
    this.create();
    this.layout();
  }
}