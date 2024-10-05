import { SplitView, SplitViewItem, VerticalViewItem } from "../../../base/browser/ui/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart } from "../parts/ActivitybarPart";
import { SidebarPart, SidebarPartService } from "../parts/SidebarPart";
import { SessionPart } from "../parts/SessionPart";
import { Orientation } from "../../../base/browser/ui/sash/Sash";
import { LayoutSizeType, Parts, WorkbenchLayoutService } from "./Workbench";
import { getClientArea } from "../../../base/browser/dom";
import { bodyLayoutServiceId, getService, Service, setService, sidebarPartServiceId } from "../../../service";
import { BookmarkComposite } from "../composite/BookmarkComposite";
import { SampleComposite } from "../composite/SampleComposite";

export interface BodyOptions {
  sizeType?: LayoutSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
}

export class Body extends Layout implements VerticalViewItem, BodyLayoutService {

  layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
    let dimension = getClientArea(this.mainContainer);
    console.log('dimension =', dimension);
    this.splitView.layout(dimension.width);
  }

  activitybarPart: ActivitybarPart;
  sidebarPart: SidebarPart;
  sessionPart: SessionPart;
  splitView: SplitView;

  constructor(parent: HTMLElement, options: BodyOptions) {
    super(parent);
    if(options) {
      this._sizeType = options.sizeType;
    }
    setService(bodyLayoutServiceId, this);
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
    const activitybarPart = this.activitybarPart = new ActivitybarPart(null, Parts.ACTIVITYBAR_PART, 'none', ['activitybar'], null);
    activitybarPart.create();
    const sidebarPart = this.sidebarPart = new SidebarPart(null, Parts.SIDEBAR_PART, 'none', ['sidebar'], null);
    sidebarPart.create();
    const sessionPart = this.sessionPart = new SessionPart(null, Parts.SESSION_PART, 'none', ['session'], { sizeType: 'fill_parent' });
    sessionPart.create();
    const splitView = this.splitView = new SplitView(this.mainContainer, { orientation: Orientation.HORIZONTAL });
    splitView.addView(activitybarPart);
    splitView.addView(sidebarPart);
    splitView.addView(sessionPart);

    this.parent && this.parent.appendChild(this.mainContainer);
  }

  inflate(): void {
    const compositeList = [
      {
        title: 'Bookmarks',
        composite: BookmarkComposite,
        id: BookmarkComposite.ID,
        codicon: 'info',
        onClick: (e: any) => {
          const activeComposite = this.sidebarPartService.getActiveComposite();
          // toggle or switch
          console.log('activeComposite =', activeComposite);
          console.log('typeof activeComposite =', typeof activeComposite);
          console.log('instanceof BookmarkComposite =', activeComposite instanceof BookmarkComposite);
        }
      },
      {
        title: 'Sample',
        composite: SampleComposite,
        id: SampleComposite.ID,
        codicon: 'info',
        onClick: (e: any) => {}
      },
    ];

    // todo: get stored selected action from concrete

    const activitybarPartContent = this.activitybarPart.getContentArea();

    const ul = document.createElement('ul');
    ul.className = 'actions-container';

    compositeList.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add(...'action-item'.split(' '));
      li.addEventListener('click', item.onClick);
      const a = document.createElement('a');
      a.classList.add(...`codicon codicon-${item.codicon}`.split(' '));
      li.appendChild(a);
      ul.appendChild(li);
    });

    activitybarPartContent.appendChild(ul);

    // const sidebarPartContent = this.sidebarPart.getContentArea();
    const selected = compositeList[0];
    const composite = new selected.composite(selected.id);
    this.sidebarPartService.showComposite(composite);
  }

  sidebarPartService: SidebarPartService;

  getServices(): void {
    this.sidebarPartService = getService(sidebarPartServiceId);
  }

}