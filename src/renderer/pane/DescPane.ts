import { Pane, PaneOptions } from "../Pane";
import { $ } from "../util/dom";

export class DescPane extends Pane {

  constructor(parent: HTMLElement, options: PaneOptions) {
    super(parent, options);
    this.element.classList.add('desc');
    this.minimumSize = Pane.HEADER_SIZE;
  }

  renderHeader(container: HTMLElement): void {
    // const klass: string = this.expanded ? '' : 'collapsed';
    if(!this.expanded)
      this.header.classList.add('collapsed');
    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    this.header.appendChild(arrow);
    const title = $('h3.title');
    title.innerHTML = 'DESC';
    this.header.appendChild(title);
  }

  renderBody(container: HTMLElement): void {
    // draw description in body in here
  }

}