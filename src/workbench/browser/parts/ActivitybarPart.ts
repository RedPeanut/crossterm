import { HorizontalViewItem } from '../../../base/browser/ui/SplitView';
import { ACTIVITYBAR_WIDTH } from '../layout/Workbench';
import { Part } from '../Part';

export class ActivitybarPart extends Part implements HorizontalViewItem {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this._size = ACTIVITYBAR_WIDTH;
  }

  layoutContainer(offset: number): void {
    this._splitViewContainer.style.left = `${offset}px`;
    this._splitViewContainer.style.width = `${this._size}px`;
  }

  override createContentArea(): HTMLElement {
    const part = super.createContentArea();
    const ul = document.createElement('ul');
    ul.className = 'actions-container';

    let actionList = [
      {
        title: 'Bookmarks',
        onClick: (e: any) => {}
      },
    ];

    let onClick = (e: any) => {
      for(let i = 0; i < actionList.length; i++) {

      }
      // how control sidebar in here?
    };

    ['Bookmarks', 'Sample1', 'Sample2'].forEach((action) => {
      const li = document.createElement('li');
      li.classList.add(...'action-item'.split(' '));
      li.addEventListener('click', (e) => {

      });
      const a = document.createElement('a');
      a.classList.add(...'codicon codicon-info'.split(' '));
      li.appendChild(a);
      ul.appendChild(li);
    });
    part.appendChild(ul);
    return part;
  }
}