import { isSplitItem, SplitItem, TerminalItem } from '../../../Types';
import { $ } from '../../../base/browser/dom';
import { HorizontalViewItem, SplitView, SplitViewItemView } from '../../../base/browser/ui/SplitView';
import { Part } from '../Part';
import { GroupView } from './view/GroupView';

export class SessionPart extends Part /* implements HorizontalViewItem */ {
  
  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  /* initial case
  tree: SplitItem = { mode: 'horizontal', list: [] }; */
  /* case1. single multi tab */
  tree: SplitItem = {
    list:[
      [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}]
    ]
  };

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    // this.size = SESSION_WIDTH;
    this.sizeType = 'fill_parent';
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
        style = {[sizeProperty]: size};
      }

      if(isSplitItem(item)) {
      } else {
        const groupView = new GroupView(null, item as TerminalItem[], style);
        groupView.create();
        result.push(groupView);
      }
    }
    return result;
  }

  renderTreeRoot(container: HTMLElement, root: SplitItem, depth: number): HTMLElement[] {
    let result: HTMLElement[] = [];
    if(isSplitItem(root)) {
    } else {
      const wrapper = $('.wrapper');
      const results: SplitViewItemView[] = this.renderTreeList(wrapper, root, depth+1);
      for(let i = 0; i < results.length; i++)
        wrapper.appendChild(results[i].element);
      result.push(wrapper);
    }
    return result;
  }

  createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();
    const results: HTMLElement[] = this.renderTreeRoot(null, this.tree, 0);
    for(let i = 0; i < results.length; i++)
      container.appendChild(results[i]);
    return container;
  }

}