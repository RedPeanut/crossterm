import { Orientation } from '../component/Sash';
import { Group, isSplitItem, SplitItem } from '../Types';
import { $, getClientArea } from '../util/dom';
import { SplitView, SplitViewItem, SplitViewItemView, MappedSashEvent } from '../component/SplitView';
import { Part, PartOptions } from '../Part';
import { GroupView } from './view/GroupView';
import { OrientationView } from './view/OrientationView';
import { Service, sessionPartServiceId, setService } from '../Service';
import { TerminalItem } from '../../common/Types';
import { wrapper } from '../../globals';
import { result } from 'lodash';

export interface SessionPartService extends Service {
  createTerminal(): void;
  getServices(): void;
  makeOverlayVisible(b: boolean): void;
  controlStyle({depth, index, pos}, {selected, active}): void;
  fit(): void;
}

interface SessionPartOptions extends PartOptions {}

export class SessionPart extends Part implements SessionPartService {

  override layout(offset: number, size: number): void {
    // console.log('[SessionPart] layout() is called ..');
    // console.log({ offset, size });

    if(this.resultView) {
      if(this.resultView instanceof OrientationView) {
        this.resultView.layout(offset, size);
      }
    }
  }

  override onDidChange(mappedEvent: MappedSashEvent): void {
    console.log('onDidChange is called .., mappedEvent =', mappedEvent);
    // save sidebar size in here
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  constructor(parent: HTMLElement, options: SessionPartOptions) {
    super(parent, options);
    this.sizeType = 'fill_parent';
    this.border = true;
    this.minimumSize = 240;
    setService(sessionPartServiceId, this);
  }

  // splitView: SplitView<SplitViewItemView> | undefined;
  // orientationView: OrientationView | undefined;
  // groupView: GroupView | undefined;
  resultView: OrientationView | GroupView | undefined;

  renderTree(container: HTMLElement, curr: SplitItem, depth: number): OrientationView | GroupView | undefined {
    if(curr.list && curr.list.length > 0) {
      if(curr.list.length === 1) {
        let item = curr.list[0];
        if(isSplitItem(item)) {
          // do not enter here
        } else {
          const groupView = new GroupView(null, item as Group, { style: {} });
          const element = groupView.create();
          return groupView;
        }
      } else {
        const sizeProperty = curr.mode === 'vertical' ? 'height' : 'width';
        const size = Math.floor(100 / curr.list.length) + '%';
        const style = { [sizeProperty]: size };

        const orientation = curr.mode === 'vertical' ? Orientation.VERTICAL : Orientation.HORIZONTAL;
        const orientationView = new OrientationView(null, { orientation: orientation, style: style, length: curr.list.length });
        const element = orientationView.create();

        for(let i = 0; i < curr.list.length; i++) {
          let item = curr.list[i];

          if(isSplitItem(item)) {
            item = item as SplitItem;
            const result: OrientationView | GroupView = this.renderTree(null, item, depth+1);
            orientationView.addView(result);
          } else {
            const groupView = new GroupView(null, item as Group, { style: {} });
            const element = groupView.create();
            orientationView.addView(groupView);
          }
        }
        return orientationView;
      }
    }
    return undefined;
  }

  override createContentArea(): HTMLElement {
    // console.log('[SessionPart] createContentArea() is called ..');
    const container: HTMLElement = super.createContentArea();
    const resultView: OrientationView | GroupView | undefined = this.renderTree(null, wrapper.tree, 0);
    this.resultView = resultView;
    resultView && container.appendChild(resultView.element);

    return container; // super.createContentArea();
  }

  createTerminal_r(v: OrientationView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let j = 0; j < v.terms.terms.length; j++)
          v.terms.terms[j].createTerminal();
      } else if(viewItems[i].view instanceof OrientationView) {
        // recurrence
        this.createTerminal_r(viewItems[i].view as OrientationView);
      }
    }
  }

  createTerminal(): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].createTerminal();
      } else if(this.resultView instanceof OrientationView) {
        this.createTerminal_r(this.resultView as OrientationView);
      }
    }
  }

  getServices_r(v: OrientationView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let j = 0; j < v.tabs.tabs.length; j++)
          v.tabs.tabs[j].getServices();
        v.terms.dropOverlay.getServices();
      } else if(viewItems[i].view instanceof OrientationView) {
        // recurrence
        this.getServices_r(viewItems[i].view as OrientationView);
      }
    }
  }

  getServices(): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        for(let i = 0; i < v.tabs.tabs.length; i++)
          v.tabs.tabs[i].getServices();
        v.terms.dropOverlay.getServices();
      } else if(this.resultView instanceof OrientationView) {
        this.getServices_r(this.resultView as OrientationView);
      }
    }
  }

  makeOverlayVisible_r(v: OrientationView, b: boolean): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        v.terms.wrapper.style.display = b ? 'block' : 'none';
      } else if(viewItems[i].view instanceof OrientationView) {
        this.makeOverlayVisible_r(viewItems[i].view as OrientationView, b);
      }
    }
  }

  makeOverlayVisible(b: boolean): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        v.terms.wrapper.style.display = b ? 'block' : 'none';
      } else if(this.resultView instanceof OrientationView) {
        this.makeOverlayVisible_r(this.resultView as OrientationView, b);
      }
    }
  }

  controlStyle_r(
      {depth, index, pos}: {depth: number, index: number[], pos: number},
      {selected, active}: {selected: boolean, active: boolean},
      {curr, view}: {curr: number, view: OrientationView}
  ): void {
    console.log({depth, index, pos}, {selected, active});
    const viewItems = view.splitView.viewItems;
    if(depth === curr) {
      if(viewItems[index[curr]].view instanceof GroupView) {
        const v: GroupView = viewItems[index[curr]].view as GroupView;

        if(selected) {
          for(let i = 0; i < v.tabs.tabs.length; i++) {
            v.tabs.tabs[i].element.classList.remove('selected');
            v.terms.terms[i].element.classList.remove('selected');
          }
          v.tabs.tabs[pos].element.classList.add('selected');
          v.terms.terms[pos].element.classList.add('selected');
        } else {
          v.tabs.tabs[pos].element.classList.remove('selected');
          v.terms.terms[pos].element.classList.remove('selected');
        }

        if(active) {
          v.tabs.tabs[pos].element.classList.add('active');
          v.terms.terms[pos].element.classList.add('active');
        } else {
          v.tabs.tabs[pos].element.classList.remove('active');
          v.terms.terms[pos].element.classList.remove('active');
        }
      } else if(viewItems[index[curr]].view instanceof OrientationView) {
        // not enter here
      }
    } else {
      const v = viewItems[index[curr]].view;
      if(v instanceof GroupView) {
        // not enter here
      } else if(v instanceof OrientationView) {
        this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: curr+1, view: v as OrientationView});
      }
    }
  }

  /**
   *
   * @param ...
   */
  controlStyle(
      {depth, index, pos}: {depth: number, index: number[], pos: number},
      {selected, active}: {selected: boolean, active: boolean}
  ): void {
    const curr = 0;
    if(this.resultView) {
      if(depth === curr) {
        if(this.resultView instanceof GroupView) {
          const v: GroupView = this.resultView as GroupView;

          if(selected) {
            for(let i = 0; i < v.tabs.tabs.length; i++) {
              v.tabs.tabs[i].element.classList.remove('selected');
              v.terms.terms[i].element.classList.remove('selected');
            }
            v.tabs.tabs[pos].element.classList.add('selected');
            v.terms.terms[pos].element.classList.add('selected');
          } else {
            v.tabs.tabs[pos].element.classList.remove('selected');
            v.terms.terms[pos].element.classList.remove('selected');
          }

          if(active) {
            v.tabs.tabs[pos].element.classList.add('active');
            v.terms.terms[pos].element.classList.add('active');
          } else {
            v.tabs.tabs[pos].element.classList.remove('active');
            v.terms.terms[pos].element.classList.remove('active');
          }
        } else if(this.resultView instanceof OrientationView) {
          const orientationView: OrientationView = this.resultView as OrientationView;
          const v = orientationView.splitView.viewItems[index[curr]].view as GroupView;

          if(selected) {
            for(let i = 0; i < v.tabs.tabs.length; i++) {
              v.tabs.tabs[i].element.classList.remove('selected');
              v.terms.terms[i].element.classList.remove('selected');
            }
            v.tabs.tabs[pos].element.classList.add('selected');
            v.terms.terms[pos].element.classList.add('selected');
          } else {
            v.tabs.tabs[pos].element.classList.remove('selected');
            v.terms.terms[pos].element.classList.remove('selected');
          }

          if(active) {
            v.tabs.tabs[pos].element.classList.add('active');
            v.terms.terms[pos].element.classList.add('active');
          } else {
            v.tabs.tabs[pos].element.classList.remove('active');
            v.terms.terms[pos].element.classList.remove('active');
          }
        }
      } else {
        if(this.resultView instanceof GroupView) {
          // not enter here
        } else if(this.resultView instanceof OrientationView) {
          const orientationView = this.resultView as OrientationView;
          const v = orientationView.splitView.viewItems[index[curr]].view;
          if(v instanceof GroupView) {
            // not enter here
          } else if(v instanceof OrientationView) {
            this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: curr+1, view: v as OrientationView});
          }
        }
      }
    }
  }

  fit_r(v: OrientationView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].fit();
      } else if(viewItems[i].view instanceof OrientationView) {
        this.fit_r(viewItems[i].view as OrientationView);
      }
    }
  }

  fit(): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].fit();
      } else if(this.resultView instanceof OrientationView) {
        this.fit_r(this.resultView as OrientationView);
      }
    }
  }
}