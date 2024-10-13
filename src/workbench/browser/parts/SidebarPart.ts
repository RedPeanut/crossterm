import { Service, setService, sidebarPartServiceId } from '../../../service';
import { $, hide, show } from '../../../base/browser/dom';
import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { Composite } from '../Composite';
import { SIDEBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export interface SidebarPartService extends Service {
  showComposite(composite: Composite): void;
  getActiveComposite(): Composite | undefined;
  hideActiveComposite(): Composite | undefined;
}

export class SidebarPart extends Part implements SidebarPartService {

  mapCompositeToCompositeContainer = new Map<string, HTMLElement>();
  activeComposite: Composite | undefined;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = SIDEBAR_WIDTH;
    setService(sidebarPartServiceId, this);
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  showComposite(composite: Composite): void {
    // Remember Composite
    this.activeComposite = composite;

    let compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
    if(!compositeContainer) {
      compositeContainer = $('.composite');
      compositeContainer.id = composite.getId();
      composite.create(compositeContainer);
      this.mapCompositeToCompositeContainer.set(composite.getId(), compositeContainer);
    }
    const contentArea = this.getContentArea();
    contentArea.appendChild(compositeContainer);
    show(compositeContainer);
    composite.setVisible(true);

    /* // Make sure the composite is layed out
    if(this.contentAreaSize) {
      composite.layout(this.contentAreaSize);
    } */
  }

  getActiveComposite(): Composite | undefined {
    return this.activeComposite;
  }

  hideActiveComposite(): Composite | undefined {
    if(!this.activeComposite) {
      return undefined; // Nothing to do
    }

    const composite = this.activeComposite;
    this.activeComposite = undefined;

    const compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());

    // Indicate to Composite
    composite.setVisible(false);

    // Take Container Off-DOM and hide
    if(compositeContainer) {
      compositeContainer.remove();
      hide(compositeContainer);
    }
    
    return composite;
  }

}