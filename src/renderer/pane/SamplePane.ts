import { Pane, PaneOptions } from "../Pane";
import { getService, sidebarPartServiceId } from "../Service";
import { SidebarPartService } from "../part/SidebarPart";
import { $ } from "../util/dom";

export class SamplePane extends Pane {

  override layout(offset: number, size: number) {
    // console.log(`layout is called .., offset = ${offset}, size = ${size}`);
  }

  constructor(parent: HTMLElement, options: PaneOptions) {
    super(parent, options);
    this.element.classList.add('detail');
    this.minimumSize = Pane.HEADER_SIZE;
  }

  renderHeader(container: HTMLElement): void {
    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    arrow.addEventListener('click', (e: MouseEvent) => {
      this.expanded = !this.expanded;
      (getService(sidebarPartServiceId) as SidebarPartService).layout(null, null);
    });
    this.header.appendChild(arrow);
    const title = $('h3.title');
    title.innerHTML = 'SAMPLE';
    this.header.appendChild(title);
  }

  renderBody(container: HTMLElement): void {
    const p = $('p');
    p.innerHTML = 'blarblarblar<br/>blarblarblar<br/>blarblarblar';
    this.body.appendChild(p);
  }

}