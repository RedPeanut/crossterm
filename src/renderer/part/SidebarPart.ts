import { Service, setService, getService,
  activitybarPartServiceId, mainLayoutServiceId, sidebarPartServiceId } from '../Service';
import { $, hide, show } from '../util/dom';
import { HorizontalViewItem } from '../component/SplitView';
import { Panel } from '../Panel';
import { MainLayout, SIDEBAR_WIDTH } from '../layout/MainLayout';
import { Part } from '../Part';
import { ActivitybarPart, ActivitybarPartService } from "./ActivitybarPart";

export interface SidebarPartService extends Service {
  showPanel(panel: Panel): void;
  getActivePanel(): Panel | undefined;
  hideActivePanel(): Panel | undefined;
}

export class SidebarPart extends Part implements SidebarPartService {

  override doWhenVisible(visible: boolean) {
    if(visible) {
      const activitybarPartService = getService(activitybarPartServiceId) as ActivitybarPartService;
      activitybarPartService.restoreActiveItem();
      this.restoreActivePanel();
    } else {
      const activitybarPartService = getService(activitybarPartServiceId) as ActivitybarPartService;
      activitybarPartService.hideActiveItem();
      this.hideActivePanel();
    }
    (getService(mainLayoutServiceId) as MainLayout).layout();
  }

  mapPanelToPanelContainer = new Map<string, HTMLElement>();
  activePanel: Panel | undefined;
  lastActivePanel: Panel | undefined = undefined;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = SIDEBAR_WIDTH;
    this.minimumSize = 120;
    this.border = true;
    this.sashEnablement = false;
    setService(sidebarPartServiceId, this);
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  showPanel(panel: Panel): void {
    // Remember Panel
    this.activePanel = panel;

    let panelContainer = this.mapPanelToPanelContainer.get(panel.getId());
    if(!panelContainer) {
      panelContainer = $('.panel');
      panelContainer.id = panel.getId();
      panel.create(panelContainer);
      this.mapPanelToPanelContainer.set(panel.getId(), panelContainer);
    }

    const contentArea = this.getContentArea();
    contentArea.appendChild(panelContainer);
    show(panelContainer);
    panel.setVisible(true);

    /* // Make sure the panel is layed out
    if(this.contentAreaSize) {
      panel.layout(this.contentAreaSize);
    } */
  }

  getActivePanel(): Panel | undefined {
    return this.activePanel;
  }

  hideActivePanel(): Panel | undefined {
    if(!this.activePanel)
      return undefined; // Nothing to do

    const panel = this.activePanel;
    const panelContainer = this.mapPanelToPanelContainer.get(panel.getId());

    // Indicate to Panel
    panel.setVisible(false);

    // Take Container Off-DOM and hide
    if(panelContainer) {
      panelContainer.remove();
      hide(panelContainer);
    }

    this.lastActivePanel = panel;
    this.activePanel = undefined;
    return panel;
  }

  restoreActivePanel(): Panel | undefined {
    if(!this.lastActivePanel)
      return undefined;

    this.showPanel(this.lastActivePanel);
  }
}