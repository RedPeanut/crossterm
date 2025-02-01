import { VerticalViewItem } from '../component/SplitView';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { $ } from '../util/dom';

export class TitlebarPart extends Part {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
    // this.border = true;
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();
    const left = $('.left');
    const center = $('.center');
    const title = $('.title');
    title.innerHTML = 'crossterm';
    center.appendChild(title);
    const right = $('.right');
    const settingBtn = $('a.codicon.codicon-settings-gear');
    // const settingBtn = $('a.codicon.codicon-settings');
    const closeBtn = $('a.codicon.codicon-close');
    right.appendChild(settingBtn);
    right.appendChild(closeBtn);

    container.appendChild(left);
    container.appendChild(center);
    container.appendChild(right);
    return container;
  }

}