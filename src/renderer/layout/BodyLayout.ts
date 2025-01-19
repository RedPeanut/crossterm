import { SplitView, SplitViewItem, SplitViewItemSizeType, SplitViewItemView, VerticalViewItem } from "../component/SplitView";
import { Layout } from "../Layout";
import { ActivitybarPart, ActivitybarPartService } from "../part/ActivitybarPart";
import { SidebarPart, SidebarPartService } from "../part/SidebarPart";
import { SessionPart } from "../part/SessionPart";
import { Orientation } from "../component/Sash";
import { Parts, MainLayoutService } from "./MainLayout";
import { getClientArea } from "../util/dom";
import { activitybarPartServiceId, bodyLayoutServiceId, getService, Service, setService, sidebarPartServiceId } from "../Service";
import { BookmarkPanel } from "../panel/BookmarkPanel";
import { SamplePanel } from "../panel/SamplePanel";
import { ActivitybarItem } from "../part/item/ActivitybarItem";

export interface BodyOptions {
  sizeType?: SplitViewItemSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
  recreate(): void;
  layout(offset: number, size: number): void;
}

export class BodyLayout extends Layout implements BodyLayoutService, SplitViewItemView {

  get element(): HTMLElement { return this.mainContainer; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  _border: boolean = false;
  get border(): boolean { return this._border; }
  set border(border: boolean) { this._border = border; }

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
    this.border = true;
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
    const items = [
      {
        title: 'Bookmarks',
        id: 'activitybar-item.bookmark',
        panel: new BookmarkPanel(),
        codicon: 'bookmark',
        onClick: (e: any) => {
          // toggle or switch
          const activeItem: ActivitybarItem = this.activitybarPartService.getActiveItem();
          if(activeItem) {
            if(activeItem.id === items[0].id) {
              activeItem.element.classList.remove('checked');
            } else {
              activeItem.element.classList.remove('checked');
              this.activitybarPartService.updateChecked(items[0].id, true);
            }
          } else
            this.activitybarPartService.updateChecked(items[0].id, true);

          const activePanel = this.sidebarPartService.getActivePanel();
          if(activePanel instanceof BookmarkPanel) {
            this.sidebarPartService.hideActivePanel();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPartService.hideActivePanel();
            this.sidebarPartService.showPanel(items[0].panel);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
        }
      },
      {
        title: 'Sample',
        id: 'activitybar-item.sample',
        panel: new SamplePanel(),
        codicon: 'info',
        onClick: (e: any) => {
          const activeItem: ActivitybarItem = this.activitybarPartService.getActiveItem();
          if(activeItem) {
            if(activeItem.id === items[1].id) {
              activeItem.element.classList.remove('checked');
            } else {
              activeItem.element.classList.remove('checked');
              this.activitybarPartService.updateChecked(items[1].id, true);
            }
          } else
            this.activitybarPartService.updateChecked(items[1].id, true);

          const activePanel = this.sidebarPartService.getActivePanel();
          if(activePanel instanceof SamplePanel) {
            this.sidebarPartService.hideActivePanel();
            this.setPartHidden(true, Parts.SIDEBAR_PART);
          } else {
            this.sidebarPartService.hideActivePanel();
            this.sidebarPartService.showPanel(items[1].panel);
            this.setPartHidden(false, Parts.SIDEBAR_PART);
          }
        }
      },
    ];

    // todo: get active item from disk
    const activeItemIndex = 0;
    const selected = items[activeItemIndex];

    const activitybarPartContent = this.activitybarPart.getContentArea();

    const ul = document.createElement('ul');
    ul.className = 'activitybar-item-container';

    items.forEach((item) => {
      this.activitybarPartService.addItem(ul, item);
    });

    activitybarPartContent.appendChild(ul);
    this.activitybarPartService.updateChecked(selected.id, true);

    // const sidebarPartContent = this.sidebarPart.getContentArea();
    const panel = selected.panel;
    this.sidebarPartService.showPanel(panel);
  }

  recreate(): void {
    const _old = this.sessionPart;
    const _new = this.sessionPart = new SessionPart(null, Parts.SESSION_PART, 'none', ['session'], { sizeType: 'fill_parent' });
    _new.create();
    this.splitView.replaceView(_old, _new);
  }

  activitybarPartService: ActivitybarPartService;
  sidebarPartService: SidebarPartService;

  getServices(): void {
    this.activitybarPartService = getService(activitybarPartServiceId);
    this.sidebarPartService = getService(sidebarPartServiceId);
  }

}