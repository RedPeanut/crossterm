import { Orientation } from '../component/Sash';
import { Group, isSplitItem, SplitItem } from '../Types';
import { $, getClientArea } from '../util/dom';
import { SplitView, SplitViewItem, SplitViewItemView } from '../component/SplitView';
import { Part } from '../Part';
import { GroupView } from './view/GroupView';
import { GridView } from './view/GridView';
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

export class SessionPart extends Part implements SessionPartService {

  override layout(offset: number, size: number): void {
    // console.log('[SessionPart] layout() is called ..');
    // console.log({ offset, size });

    if(this.resultView) {
      if(this.resultView instanceof GridView) {
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

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    // this.size = SESSION_WIDTH;
    this.sizeType = 'fill_parent';
    this.border = true;
    this.minimumSize = 240;
    setService(sessionPartServiceId, this);
  }

  // splitView: SplitView<SplitViewItemView> | undefined;
  // gridView: GridView | undefined;
  // groupView: GroupView | undefined;
  resultView: GridView | GroupView | undefined;

  renderTree(container: HTMLElement, curr: SplitItem, depth: number): GridView | GroupView | undefined {
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
        const gridView = new GridView(null, { orientation: orientation, style: style, length: curr.list.length });
        const element = gridView.create();

        for(let i = 0; i < curr.list.length; i++) {
          let item = curr.list[i];

          if(isSplitItem(item)) {
            item = item as SplitItem;
            const result: GridView | GroupView = this.renderTree(null, item, depth+1);
            gridView.addView(result);
          } else {
            const groupView = new GroupView(null, item as Group, { style: {} });
            const element = groupView.create();
            gridView.addView(groupView);
          }
        }
        return gridView;
      }
    }
    return undefined;
  }

  override createContentArea(): HTMLElement {
    // console.log('[SessionPart] createContentArea() is called ..');
    const container: HTMLElement = super.createContentArea();
    const resultView: GridView | GroupView | undefined = this.renderTree(null, wrapper.tree, 0);
    this.resultView = resultView;
    resultView && container.appendChild(resultView.element);

    return container;
  }

  createTerminal_r(v: GridView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let j = 0; j < v.terms.terms.length; j++)
          v.terms.terms[j].createTerminal();
      } else if(viewItems[i].view instanceof GridView) {
        // recurrence
        this.createTerminal_r(viewItems[i].view as GridView);
      }
    }
  }

  createTerminal(): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].createTerminal();
      } else if(this.resultView instanceof GridView) {
        this.createTerminal_r(this.resultView as GridView);
      }
    }
  }

  getServices_r(v: GridView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let j = 0; j < v.tabs.tabs.length; j++)
          v.tabs.tabs[j].getServices();
        v.terms.dropOverlay.getServices();
      } else if(viewItems[i].view instanceof GridView) {
        // recurrence
        this.getServices_r(viewItems[i].view as GridView);
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
      } else if(this.resultView instanceof GridView) {
        this.getServices_r(this.resultView as GridView);
      }
    }
  }

  makeOverlayVisible_r(v: GridView, b: boolean): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        v.terms.wrapper.style.display = b ? 'block' : 'none';
      } else if(viewItems[i].view instanceof GridView) {
        this.makeOverlayVisible_r(viewItems[i].view as GridView, b);
      }
    }
  }

  makeOverlayVisible(b: boolean): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        v.terms.wrapper.style.display = b ? 'block' : 'none';
      } else if(this.resultView instanceof GridView) {
        this.makeOverlayVisible_r(this.resultView as GridView, b);
      }
    }
  }

  controlStyle_r(
      {depth, index, pos}: {depth: number, index: number[], pos: number},
      {selected, active}: {selected: boolean, active: boolean},
      {curr, view}: {curr: number, view: GridView}
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
      } else if(viewItems[index[curr]].view instanceof GridView) {
        // not enter here
      }
    } else {
      const v = viewItems[index[curr]].view;
      if(v instanceof GroupView) {
        // not enter here
      } else if(v instanceof GridView) {
        this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: curr+1, view: v as GridView});
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
        } else if(this.resultView instanceof GridView) {
          const gridView: GridView = this.resultView as GridView;
          const v = gridView.splitView.viewItems[index[curr]].view as GroupView;

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
        } else if(this.resultView instanceof GridView) {
          const gridView = this.resultView as GridView;
          const v = gridView.splitView.viewItems[index[curr]].view;
          if(v instanceof GroupView) {
            // not enter here
          } else if(v instanceof GridView) {
            this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: curr+1, view: v as GridView});
          }
        }
      }
    }
  }

  fit_r(v: GridView): void {
    const viewItems = v.splitView.viewItems;
    for(let i = 0; i < viewItems.length; i++) {
      if(viewItems[i].view instanceof GroupView) {
        const v: GroupView = viewItems[i].view as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].fit();
      } else if(viewItems[i].view instanceof GridView) {
        this.fit_r(viewItems[i].view as GridView);
      }
    }
  }

  fit(): void {
    if(this.resultView) {
      if(this.resultView instanceof GroupView) {
        const v: GroupView = this.resultView as GroupView;
        for(let i = 0; i < v.terms.terms.length; i++)
          v.terms.terms[i].fit();
      } else if(this.resultView instanceof GridView) {
        this.fit_r(this.resultView as GridView);
      }
    }
  }
}