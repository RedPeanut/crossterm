import { activitybarPartServiceId, getService, setService, mainLayoutServiceId } from '../Service';
import { HorizontalViewItem } from '../component/SplitView';
import { ACTIVITYBAR_WIDTH, MainLayoutService } from '../layout/MainLayout';
import { Part } from '../Part';
import { BookmarkPanel } from '../panel/BookmarkPanel';
import { SamplePanel } from '../panel/SamplePanel';
import { ActivitybarItem, ActivitybarItemImpl } from './item/ActivitybarItem';

export interface ActivitybarPartService {
  addItem(ul:HTMLElement, item: any): void;
  updateChecked(id: string, checked: boolean): void;
  getActiveItem(): ActivitybarItem | undefined;
}

export class ActivitybarPart extends Part implements ActivitybarPartService {

  // mainLayoutService: MainLayoutService;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = ACTIVITYBAR_WIDTH;
    // this.border = true;
    // this.mainLayoutService = getService(mainLayoutServiceId);
    setService(activitybarPartServiceId, this);
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  } */

  override createContentArea(): HTMLElement {
    const part = super.createContentArea();

    /* const ul = document.createElement('ul');
    ul.className = 'actions-container';

    let actionList = [
      {
        title: 'Bookmarks',
        panel: BookmarkPanel,
        codicon: 'info',
        onClick: (e: any) => {
          //
        }
      },
      {
        title: 'Sample',
        panel: SamplePanel,
        codicon: 'info',
        onClick: (e: any) => {}
      },
    ];

    actionList.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add(...'activitybar-item'.split(' '));
      li.addEventListener('click', item.onClick);
      const a = document.createElement('a');
      a.classList.add(...`codicon codicon-${item.codicon}`.split(' '));
      li.appendChild(a);
      ul.appendChild(li);
    });

    part.appendChild(ul); */

    return part;
  }

  itemMap = new Map<string, ActivitybarItem>();

  addItem(ul: HTMLElement, item: any): void {
    let activitybarItem = this.itemMap.get(item.id);
    if(!activitybarItem) {
      let impl: ActivitybarItem = new ActivitybarItemImpl(ul, item.id, item.panel);
      impl.append(item.onClick, item.codicon);
      this.itemMap.set(item.id, impl);
    }
  }

  updateChecked(id: string, checked: boolean): void {
    let impl = this.itemMap.get(id);
    if(impl) {
      impl.updateChecked(checked);
    }
  }

  getActiveItem(): ActivitybarItem | undefined {
    for(let entry of this.itemMap.entries()) {
      // console.log(entry);
      if(entry[1].element.classList.contains('checked'))
        return entry[1];
    }
    return undefined;
  }

}