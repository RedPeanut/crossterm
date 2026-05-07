import { Pane, PaneOptions } from "../Pane";
import { getService, sidebarPartServiceId } from "../Service";
import { SidebarPartService } from "../part/SidebarPart";
import { $ } from "../util/dom";

export class DetailPane extends Pane {

  constructor(parent: HTMLElement, options: PaneOptions) {
    super(parent, options);
    this.element.classList.add('detail');
    this.minimumSize = Pane.HEADER_SIZE;
  }

  renderHeader(container: HTMLElement): void {
    // const klass: string = this.expanded ? '' : 'collapsed';
    if(!this.expanded)
      this.header.classList.add('collapsed');
    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    arrow.addEventListener('click', (e: MouseEvent) => {
      this.expanded = !this.expanded;
      (getService(sidebarPartServiceId) as SidebarPartService).layout(null, null);
    });
    this.header.appendChild(arrow);
    const title = $('h3.title');
    title.innerHTML = 'DETAIL';
    this.header.appendChild(title);
  }

  renderBody(container: HTMLElement): void {
    // draw description in body in here
    const p = $('p');
    p.innerHTML = 'blarblarblar<br/>blarblarblar<br/>blarblarblar';
    this.body.appendChild(p);
  }

}