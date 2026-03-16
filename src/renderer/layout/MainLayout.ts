import { coalesce } from '../util/arrays';
import { Layout } from '../Layout';
import { PartOptions, Part } from '../Part';
import { TitlebarPart } from '../part/TitlebarPart';
import { ActivitybarPart } from '../part/ActivitybarPart';
// import { BodyPart } from '../part/BodyPart';
import { StatusbarPart } from '../part/StatusbarPart';
import { SidebarPart } from '../part/SidebarPart';
import { SessionPart } from '../part/SessionPart';
import { BodyLayout, BodyLayoutService } from './BodyLayout';
import { SplitView, SplitViewItem } from '../component/SplitView';
import { getClientArea, position, size } from '../util/dom';
import { Orientation } from '../component/Sash';
import { bodyLayoutServiceId, getService, Service, sessionPartServiceId, setService, mainLayoutServiceId, menubarServiceId } from '../Service';
import { SessionPartService } from '../part/SessionPart';
import { terminals } from '../../globals';
import { MenubarService } from '../part/Menubar';
import { renderer } from '..';

export const TITLEBAR_HEIGHT = 34;
export const ACTIVITYBAR_WIDTH = 39;
export const SIDEBAR_WIDTH = 249;
// export const SESSION_WIDTH = 'fill_parent';
export const STATUSBAR_HEIGHT = 17;

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
  layout(): void;
}

export class MainLayout extends Layout implements MainLayoutService {

  layoutContainer(offset: number): void {
    throw new Error('Method not implemented.');
  }

  titlebarPart: TitlebarPart;
  // bodyLayout: BodyLayout;
  activitybarPart: ActivitybarPart;
  sidebarPart: SidebarPart;
  sessionPart: SessionPart;
  statusbarPart: StatusbarPart;
  // splitView: SplitView<TitlebarPart | BodyLayout | StatusbarPart>;

  constructor(parent: HTMLElement) {
    super(parent);
    setService(mainLayoutServiceId, this);
  }

  /* create(): void {
    // console.log('render() is called ..');

    //

    let platformClass = '', platform = '';
    if(renderer.process && renderer.process.platform)
      platform = renderer.process.platform.toLowerCase();

    if(platform.indexOf('window') > -1)
      platformClass = 'windows';
    else if(platform.indexOf('linux') > -1)
      platformClass = 'linux';
    else
      platformClass = 'mac';

    const classes = coalesce(['main', 'layout', platformClass]);
    this.container.classList.add(...classes);

    const titlebarPart = this.titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();

    const bodyLayout = this.bodyLayout = new BodyLayout(null, { sizeType: 'fill_parent' });
    bodyLayout.create();

    const statusbarPart = this.statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.VERTICAL });
    splitView.addView(titlebarPart);
    splitView.addView(bodyLayout);
    splitView.addView(statusbarPart);

    this.parent.appendChild(this.container);
  } */

  layout(): void {
    let dimension = getClientArea(this.parent);
    // console.log('dimension =', dimension);
    position(this.container, 0, 0, 0, 0, 'relative');
    size(this.container, dimension.width, dimension.height);
    // if(this.splitView.orientation === Orientation.HORIZONTAL)
    //   this.splitView.layout(dimension.width);
    // else
    //   this.splitView.layout(dimension.height);

    (getService(menubarServiceId) as MenubarService).layout(dimension);
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

  createPartContainer(id: string, role: string, classes: string[]): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', ...classes);
    part.id = id;
    part.setAttribute('role', role);
    return part;
  }

  createParts(): void {
    // Create Parts
    for (const { klass, id, role, classes, options } of [
      { klass: TitlebarPart, id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'] },
      { klass: ActivitybarPart, id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar' ] },
      { klass: SidebarPart, id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar' ] },
      { klass: SessionPart, id: Parts.SESSION_PART, role: 'none', classes: ['session'], options: { sizeType: 'fill_parent' } },
      { klass: StatusbarPart, id: Parts.STATUSBAR_PART, role: 'none', classes: ['statusbar'] }
    ]) {
      const container = this.createPartContainer(id, role, classes);
      const part: Part = Reflect.construct(klass, [ container, options ]);
      this.registerPart(part);
      part.create();
    }
    // console.log('this.parts =', this.parts);
  }

  startup(): void {
    this.createParts();

    /* this.create();
    this.getServices();
    this.bodyLayoutService.inflate();
    this.layout();
    this.installIpc();

    const resize = () => {
      this.layout();
    };

    let resizeTimeout: NodeJS.Timeout = null;
    let _handleResize = () => {
      if(resizeTimeout)
        clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };

    window.addEventListener('resize', () => {
      // console.log('resize event is called ..');
      _handleResize();
    });

    // create terminal after layout n ipc install
    this.sessionPartService.createTerminal(); */
  }

  toggleSidebar(): void {
    throw new Error('Method not implemented.');
  }

}