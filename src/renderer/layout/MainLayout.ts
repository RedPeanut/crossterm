import { coalesce } from '../util/arrays';
import { isLinux, isWindows } from '../util/platform';
import { Layout } from '../Layout';
import { PartOptions, Part } from '../Part';
import { TitlebarPart } from '../part/TitlebarPart';
import { ActivitybarPart } from '../part/ActivitybarPart';
// import { BodyPart } from '../part/BodyPart';
import { StatusbarPart } from '../part/StatusbarPart';
import { BodyLayout, BodyLayoutService } from './BodyLayout';
import { SplitView, SplitViewItem } from '../component/SplitView';
import { getClientArea, position, size } from '../util/dom';
import { Orientation } from '../component/Sash';
import { bodyLayoutServiceId, getService, Service, sessionPartServiceId, setService, mainLayoutServiceId } from '../Service';
import { SessionPartService } from '../part/SessionPart';
import { terminals } from '../../globals';
// import Runtime from './Runtime';

export const TITLEBAR_HEIGHT = 42;
export const ACTIVITYBAR_WIDTH = 48;
export const SIDEBAR_WIDTH = 220;
// export const SESSION_WIDTH = 'fill_parent';
export const STATUSBAR_HEIGHT = 22;

export const enum Parts {
  TITLEBAR_PART = 'part.titlebar',
  ACTIVITYBAR_PART = 'part.activitybar',
  BODY_LAYOUT = 'layout.body',
  SIDEBAR_PART = 'part.sidebar',
  SESSION_PART = 'part.session',
  STATUSBAR_PART = 'part.statusbar'
}

export interface MainLayoutService extends Service {
  toggleSidebar(): void;
}

export class MainLayout extends Layout implements MainLayoutService {

  layoutContainer(offset: number): void {
    throw new Error('Method not implemented.');
  }

  titlebarPart: TitlebarPart;
  bodyLayout: BodyLayout;
  statusbarPart: StatusbarPart;
  splitView: SplitView<TitlebarPart | BodyLayout | StatusbarPart>;

  constructor(parent: HTMLElement) {
    super(parent);
    setService(mainLayoutServiceId, this);
  }

  create(): void {
    // console.log('render() is called ..');

    //
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac'; //Runtime.isWindows ? 'windows' : Runtime.isLinux ? 'linux' : 'mac';
    const workbenchClasses = coalesce(['workbench', 'layout', platformClass]);
    this.mainContainer.classList.add(...workbenchClasses);

    const titlebarPart = this.titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();

    const bodyLayout = this.bodyLayout = new BodyLayout(null, { sizeType: 'fill_parent' });
    bodyLayout.create();

    const statusbarPart = this.statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    const splitView = this.splitView = new SplitView(this.mainContainer, { orientation: Orientation.VERTICAL });
    splitView.addView(titlebarPart);
    splitView.addView(bodyLayout);
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
    // console.log('dimension =', dimension);
    position(this.mainContainer, 0, 0, 0, 0, 'relative');
    size(this.mainContainer, dimension.width, dimension.height);
    if(this.splitView.orientation === Orientation.HORIZONTAL)
      this.splitView.layout(dimension.width);
    else
      this.splitView.layout(dimension.height);
  }

  bodyLayoutService: BodyLayoutService;
  sessionPartService: SessionPartService;

  getServices(): void {
    this.bodyLayoutService = getService(bodyLayoutServiceId);
    this.bodyLayoutService.getServices();
    this.sessionPartService = getService(sessionPartServiceId);
    this.sessionPartService.getServices();
  }

  installIpc(): void {
    window.ipc.on('terminal data', (...args: any[]) => {
      // console.log('terminal data event is called..');
      // console.log('args =', args);
      const raw: string = args[1];
      const uid = raw.slice(0, 36);
      const data = raw.slice(36);
      const term = terminals[uid];
      if(term) {
        term.xterm.write(data);
      }
    });
  }

  startup(): void {
    this.create();
    this.getServices();
    this.bodyLayoutService.inflate();
    this.layout();
    this.installIpc();

    // create terminal after layout n ipc install
    this.sessionPartService.createTerminal();
  }

  toggleSidebar(): void {
    throw new Error('Method not implemented.');
  }

}