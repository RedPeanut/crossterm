import { Service, setService, getService,
  activitybarPartServiceId, mainLayoutServiceId, sidebarPartServiceId } from '../Service';
import { $, append, getClientArea, hide, show } from '../util/dom';
import { HorizontalViewItem } from '../component/SplitView';
import { Panel } from '../Panel';
import { MainLayout, SIDEBAR_WIDTH } from '../layout/MainLayout';
import { Part, PartOptions } from '../Part';
import { ActivitybarPart, ActivitybarPartService } from "./ActivitybarPart";
import { renderer } from '..';
import { PaneView } from '../PaneView';

export interface SidebarPartService extends Service {
  // showPanel(panel: Panel): void;
  // getActivePanel(): Panel | undefined;
  // hideActivePanel(): Panel | undefined;
  layout(offset: number, size: number): void;
}

interface SidebarPartOptions extends PartOptions {}

export class SidebarPart extends Part implements SidebarPartService {

  static TITLE_HEIGHT = 28;

  override layout(offset: number, size: number): void {
    let dimension = getClientArea(this.container);
    let width = dimension.width, height = dimension.height;
    height = height - SidebarPart.TITLE_HEIGHT;
    this.activePaneView && this.activePaneView.layout(width, height);
  }

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
    // (getService(mainLayoutServiceId) as MainLayout).layout(); // not working properly
  }

  mapPanelToPanelContainer = new Map<string, HTMLElement>();
  activePanel: Panel | undefined;
  lastActivePanel: Panel | undefined = undefined;

  constructor(options: SidebarPartOptions) {
    super(options);
    this.size = renderer.initial_value.sidebar_size;
    this.minimumSize = 120;
    this.border = true;
    this.sashEnablement = false;
    this.preferredWidth = 240;
    setService(sidebarPartServiceId, this);
  }

  showPanel(panel: Panel): void {
    this.activePanel = panel;

    let panelContainer = this.mapPanelToPanelContainer.get(panel.getId());
    if(!panelContainer) {
      panelContainer = $('.panel-container');
      panelContainer.id = panel.getId();
      panel.create(panelContainer);
      this.mapPanelToPanelContainer.set(panel.getId(), panelContainer);
    }

    const container = this.container;
    container.appendChild(panelContainer);
    show(panelContainer);
    panel.setVisible(true);
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

  activePaneView: PaneView;
  lastActivePaneView: PaneView;
  mapPaneViewToContainer = new Map<string, HTMLElement>();
  titleArea: HTMLElement;
  contentArea: HTMLElement;

  showPaneView(title: string, paneView: PaneView) {
    const label = this.titleArea.querySelector('h2.label');
    label.innerHTML = title;

    this.activePaneView = paneView;

    let paneViewContainer = this.mapPaneViewToContainer.get(paneView.id);
    if(!paneViewContainer) {
      paneViewContainer = $('.pane-view-container');
      paneView.create(paneViewContainer);
      this.mapPaneViewToContainer.set(paneView.id, paneViewContainer);
    }

    const contentArea = this.contentArea; // container; // getContentArea();
    contentArea.appendChild(paneViewContainer);
    show(paneViewContainer);

    // this.layout();
    // (getService(mainLayoutServiceId) as MainLayout).layout();
  }

  hideActivePaneView(): PaneView | undefined {
    if(!this.activePaneView)
      return undefined;

    const paneView = this.activePaneView;
    const paneViewContainer = this.mapPaneViewToContainer.get(paneView.id);
    if(paneViewContainer) {
      paneViewContainer.remove();
      hide(paneViewContainer);
    }

    this.lastActivePaneView = paneView;
    this.activePaneView = undefined;
    return paneView;
  }

  override create(): void {
    super.create();
    const container = this.container;
    const titleArea = this.titleArea = append(container, $('.title'));
    const h2 = append(titleArea, $('h2.label'));
    const contentArea = this.contentArea = append(container, $('.content'));
  }

}