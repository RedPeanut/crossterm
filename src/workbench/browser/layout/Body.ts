import { SplitView, SplitViewItem, SplitViewItemSizeType, SplitViewItemView, VerticalViewItem } from "../../../base/browser/ui/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart } from "../parts/ActivitybarPart";
import { SidebarPart, SidebarPartService } from "../parts/SidebarPart";
import { SessionPart } from "../parts/SessionPart";
import { Orientation } from "../../../base/browser/ui/sash/Sash";
import { Parts, WorkbenchLayoutService } from "./Workbench";
import { getClientArea } from "../../../base/browser/dom";
import { bodyLayoutServiceId, getService, Service, setService, sidebarPartServiceId } from "../../../service";
import { BookmarkComposite } from "../composite/BookmarkComposite";
import { SampleComposite } from "../composite/SampleComposite";

export interface BodyOptions {
  sizeType?: SplitViewItemSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
}

export class Body extends Layout implements BodyLayoutService, SplitViewItemView {

  get element(): HTMLElement { return this.mainContainer; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
    let dimension = getClientArea(this.mainContainer);
    console.log('dimension =', dimension);
    this.splitView.layout(dimension.width); // Orientation.HORIZONTAL
  } */
  layout(offset: number, size: number): void {
    let dimension = getClientArea(this.mainContainer);
    this.splitView.layout(dimension.width);
  }

  activitybarPart: ActivitybarPart;
  sidebarPart: SidebarPart;
  sessionPart: SessionPart;
  splitView: SplitView<ActivitybarPart | SidebarPart | SessionPart>;

  constructor(parent: HTMLElement, options: BodyOptions) {
    super(parent);
    if(options) {
      this.sizeType = options.sizeType;
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

  setSidebarHidden(hidden: boolean): void {
    let found = false, i = 0;
    for(; i < this.splitView.viewItems.length; i++) {
      if(this.splitView.viewItems[i].view === this.sidebarPart) {
        found = true;
        break;
      }
    }

    if(found)
      this.splitView.setViewVisible(i, !hidden);
  }

  setPartHidden(hidden: boolean, part: Parts): void {
    switch(part) {
      case Parts.SIDEBAR_PART:
        return this.setSidebarHidden(hidden);
    }
  }

  inflate(): void {
    const compositeList = [
      {
        title: 'Bookmarks',
        composite: new BookmarkComposite(),
        id: BookmarkComposite.ID,
        codicon: 'info',
        onClick: (e: any) => {
          // toggle or switch
          const activeComposite = this.sidebarPartService.getActiveComposite();
          if(activeComposite instanceof BookmarkComposite) {
            this.sidebarPartService.hideActiveComposite();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPartService.hideActiveComposite();
            this.sidebarPartService.showComposite(compositeList[0].composite);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
        }
      },
      {
        title: 'Sample',
        composite: new SampleComposite(),
        id: SampleComposite.ID,
        codicon: 'info',
        onClick: (e: any) => {
          const activeComposite = this.sidebarPartService.getActiveComposite();
          if(activeComposite instanceof SampleComposite) {
            this.sidebarPartService.hideActiveComposite();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPartService.hideActiveComposite();
            this.sidebarPartService.showComposite(compositeList[1].composite);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
        }
      },
    ];

    // todo: get stored selected action from concrete

    const activitybarPartContent = this.activitybarPart.getContentArea();

    const ul = document.createElement('ul');
    ul.className = 'actions-container';

    compositeList.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add(...'activitybar-item'.split(' '));
      li.addEventListener('click', item.onClick);
      const a = document.createElement('a');
      a.classList.add(...`codicon codicon-${item.codicon}`.split(' '));
      li.appendChild(a);
      ul.appendChild(li);
    });

    activitybarPartContent.appendChild(ul);

    // const sidebarPartContent = this.sidebarPart.getContentArea();
    const selected = compositeList[0];
    const composite = selected.composite;
    this.sidebarPartService.showComposite(composite);
  }

  sidebarPartService: SidebarPartService;

  getServices(): void {
    this.sidebarPartService = getService(sidebarPartServiceId);
  }

}