import { Orientation } from '../component/Sash';
import { isSplitItem, SplitItem } from '../Types';
import { $ } from '../util/dom';
import { SplitViewItem, SplitViewItemView } from '../component/SplitView';
import { Part } from '../Part';
import { GroupView } from './view/GroupView';
import { GridView } from '../component/GridView';
import { Service, sessionPartServiceId, setService } from '../Service';
import { TerminalItem } from '../../common/Types';
import { wrapper } from '../../globals';

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
    if(this.gridView) {
      this.gridView.layout(offset, size);
    }
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
    setService(sessionPartServiceId, this);
  }

  renderTreeList(container: HTMLElement, parent: SplitItem, depth: number): SplitViewItemView[] {
    let result: SplitViewItemView[] = [];
    for(let i = 0; i < parent.list.length; i++) {
      let item = parent.list[i];

      let className = '';
      let style;
      if(parent.list) {
        const sizeProperty = parent.mode === 'vertical' ? 'height' : 'width';
        const size = Math.floor(100 / parent.list.length) + '%';
        style = { [sizeProperty]: size };
      }

      if(isSplitItem(item)) {
        item = item as SplitItem;
        const orientation = item.mode === 'vertical' ? Orientation.VERTICAL : Orientation.HORIZONTAL;
        const gridView = new GridView(null, { orientation: orientation, style: style, length: result.length });
        const element = gridView.create();
        const results: SplitViewItemView[] = this.renderTreeList(null, item, depth+1);
        if(results.length > 0) {
          for(let i = 0; i < results.length; i++)
            gridView.addView(results[i]);
          result.push(gridView);
        }
      } else {
        const groupView = new GroupView(null, item as TerminalItem[], { style: style });
        const element = groupView.create();
        result.push(groupView);
      }
    }
    return result;
  }

  // splitView: SplitView<SplitViewItemView>;
  gridView: GridView | undefined;

  renderTreeRoot(container: HTMLElement, root: SplitItem, depth: number): HTMLElement[] {
    let result: HTMLElement[] = [];
    const orientation = root.mode === 'vertical' ? Orientation.VERTICAL : Orientation.HORIZONTAL;
    const gridView = this.gridView = new GridView(null, { orientation: orientation, length: root.list.length });
    /* const element =  */gridView.create();
    const results: SplitViewItemView[] = this.renderTreeList(null, root, depth+1);
    if(results.length > 0) {
      for(let i = 0; i < results.length; i++)
        gridView.addView(results[i]);
      result.push(gridView.element);
    }
    return result;
  }

  override createContentArea(): HTMLElement {
    // console.log('[SessionPart] createContentArea() is called ..');
    const container: HTMLElement = super.createContentArea();
    const results: HTMLElement[] = this.renderTreeRoot(container, wrapper.tree, 0);
    for(let i = 0; i < results.length; i++)
      container.appendChild(results[i]);
    return container;
  }

  createTerminal_r(v: GridView): void {
    // const v: GridView = this.gridView.splitView.viewItems[i].view as GridView;
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
    this.createTerminal_r(this.gridView);
  }

  getServices_r(v: GridView): void {
    // const v: GridView = this.gridView.splitView.viewItems[i].view as GridView;
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
    this.getServices_r(this.gridView);
  }

  makeOverlayVisible_r(gridView: GridView, b: boolean): void {
    const viewItems = gridView.splitView.viewItems;
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
    this.makeOverlayVisible_r(this.gridView, b);
  }

  controlStyle_r(
      {depth, index, pos}: {depth: number, index: number[], pos: number},
      {selected, active}: {selected: boolean, active: boolean},
      {curr, gridView}: {curr: number, gridView: GridView}
  ): void {
    const viewItems = gridView.splitView.viewItems;
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
      for(let i = 0; i < viewItems.length; i++) {
        if(viewItems[i].view instanceof GroupView) {
          // not enter here
        } else if(viewItems[i].view instanceof GridView) {
          this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: curr+1, gridView: viewItems[i].view as GridView});
        }
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
    this.controlStyle_r({depth, index, pos}, {selected, active}, {curr: 0, gridView: this.gridView});
  }

  fit_r(gridView: GridView): void {
    const viewItems = gridView.splitView.viewItems;
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
    this.fit_r(this.gridView);
  }
}