import { MappedSashEvent, SplitView, SplitViewItem, SplitViewItemSizeType, SplitViewItemView, VerticalViewItem } from "../component/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart, ActivitybarPartService } from "../part/ActivitybarPart";
import { SidebarPart, SidebarPartService } from "../part/SidebarPart";
import { SessionPart } from "../part/SessionPart";
import { Orientation } from "../component/Sash";
import { Parts, MainLayoutService, MainLayout } from "./MainLayout";
import { getClientArea } from "../util/dom";
import { activitybarPartServiceId, bodyLayoutServiceId, getService, mainLayoutServiceId, Service, setService, sidebarPartServiceId } from "../Service";
import { BookmarkPanel } from "../panel/BookmarkPanel";
import { SamplePanel } from "../panel/SamplePanel";
import { ActivitybarItem } from "../part/item/ActivitybarItem";

export interface BodyLayoutOptions {}

export interface BodyLayoutService extends Service {
  // getServices(): void;
  inflate(): void;
  recreate(): void;
  layout(offset: number, size: number): void;
}

export class BodyLayout extends Layout implements BodyLayoutService, SplitViewItemView {

  get element(): HTMLElement { return this.container; }
  set element(e: HTMLElement) { this.container = e; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(ty: SplitViewItemSizeType) { this._sizeType = ty; }

  _minimumSize: number = 0;
  get minimumSize(): number { return this._minimumSize; }
  set minimumSize(n: number) { this._minimumSize = n; }

  _maximumSize: number = Number.POSITIVE_INFINITY;
  get maximumSize(): number { return this._maximumSize; }
  set maximumSize(n: number) { this._maximumSize = n; }

  _border: boolean = false;
  get border(): boolean { return this._border; }
  set border(b: boolean) { this._border = b; }

  _sashEnablement: boolean = true;
  get sashEnablement(): boolean { return this._sashEnablement; }
  set sashEnablement(b: boolean) { this._sashEnablement = b; }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
    let dimension = getClientArea(this.mainContainer);
    console.log('dimension =', dimension);
    this.splitView.layout(dimension.width); // Orientation.HORIZONTAL
  } */

  layout(offset: number, size: number): void {
    let dimension = getClientArea(this.container);
    this.splitView.layout(dimension.width);
  }
  onDidChange(mappedEvent: MappedSashEvent): void {}
  doWhenVisible(visible: boolean): void {}

  activitybarPart: ActivitybarPart;
  sidebarPart: SidebarPart;
  sessionPart: SessionPart;
  splitView: SplitView<ActivitybarPart | SidebarPart | SessionPart>;

  constructor(parent: HTMLElement, options: BodyLayoutOptions) {
    super(parent);
    this.sizeType = 'fill_parent';
    this.border = true;
    this.sashEnablement = false;
    setService(bodyLayoutServiceId, this);
  }

  create(): void {
    this.container.classList.add(...['body', 'layout']);
    /* for(const { klass, id, role, classes, options } of [
      { klass: SidebarPart, id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', this.getSideBarPosition() === Position.LEFT ? 'left' : 'right'] },
      { klass: SessionPart, id: Parts.SESSION_PART, role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
    ]) {
      const part = new klass(this.mainContainer, id, role, classes, options);
      this.registerPart(part);
      // this.getPart(id).create(this.mainContainer, options);
      this.getPart(id).create();
    } */

    const activitybarPart = this.activitybarPart = new ActivitybarPart({ id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar'], });
    activitybarPart.create();
    const sidebarPart = this.sidebarPart = new SidebarPart({ id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar'] });
    sidebarPart.create();
    const sessionPart = this.sessionPart = new SessionPart({ id: Parts.SESSION_PART, role: 'none', classes: ['session']/* , sizeType: 'fill_parent' */ });
    sessionPart.create();

    const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.HORIZONTAL });
    splitView.addView(activitybarPart);
    splitView.addView(sidebarPart);
    splitView.addView(sessionPart);

    this.parent && this.parent.appendChild(this.container);
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

    // const activitybarPartService = getService(activitybarPartServiceId) as ActivitybarPartService;
    // const sidebarPartService = getService(sidebarPartServiceId) as SidebarPartService;

    const items = [
      {
        title: 'Bookmarks',
        id: 'activitybar-item.bookmark',
        panel: new BookmarkPanel(),
        codicon: 'bookmark',
        onClick: (e: any) => {
          // toggle or switch
          const activeItem: ActivitybarItem = this.activitybarPart.getActiveItem();
          if(activeItem) {
            if(activeItem.id === items[0].id) {
              this.activitybarPart.hideActiveItem();
            } else {
              this.activitybarPart.changeActiveItem(items[0].id);
            }
          } else {
            this.activitybarPart.showActiveItem(items[0].id);
          }

          const activePanel = this.sidebarPart.getActivePanel();
          if(activePanel instanceof BookmarkPanel) {
            this.sidebarPart.hideActivePanel();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPart.hideActivePanel();
            this.sidebarPart.showPanel(items[0].panel);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
          (getService(mainLayoutServiceId) as MainLayout).layout();
        }
      },
      {
        title: 'Sample',
        id: 'activitybar-item.sample',
        panel: new SamplePanel(),
        codicon: 'info',
        onClick: (e: any) => {
          const activeItem: ActivitybarItem = this.activitybarPart.getActiveItem();
          if(activeItem) {
            if(activeItem.id === items[1].id) {
              this.activitybarPart.hideActiveItem();
            } else {
              this.activitybarPart.changeActiveItem(items[1].id);
            }
          } else {
            this.activitybarPart.showActiveItem(items[1].id);
          }

          const activePanel = this.sidebarPart.getActivePanel();
          if(activePanel instanceof SamplePanel) {
            this.sidebarPart.hideActivePanel();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPart.hideActivePanel();
            this.sidebarPart.showPanel(items[1].panel);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
          (getService(mainLayoutServiceId) as MainLayout).layout();
        }
      },
    ];

    // todo: get active item from disk
    const activeItemIndex = 0;
    const selected = items[activeItemIndex];

    const activitybarPartContainer = this.activitybarPart.container;

    const ul = document.createElement('ul');
    ul.className = 'activitybar-item-container';

    items.forEach((item) => {
      this.activitybarPart.addItem(ul, item);
    });

    activitybarPartContainer.appendChild(ul);
    this.activitybarPart.updateChecked(selected.id, true);

    // const sidebarPartContent = this.sidebarPart.getContentArea();
    const panel = selected.panel;
    this.sidebarPart.showPanel(panel);
  }

  recreate(): void {
    const _old = this.sessionPart;
    const _new = this.sessionPart = new SessionPart({ id: Parts.SESSION_PART, role: 'none', classes: ['session']/* , sizeType: 'fill_parent' */ });
    _new.create();
    this.splitView.replaceView(_old, _new);
  }

  /* activitybarPartService: ActivitybarPartService;
  sidebarPartService: SidebarPartService;

  getServices(): void {
    this.activitybarPartService = getService(activitybarPartServiceId);
    this.sidebarPartService = getService(sidebarPartServiceId);
  } */

}