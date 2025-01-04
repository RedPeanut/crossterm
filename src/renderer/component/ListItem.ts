import { $, append } from "../util/dom";
import { ListItemElem } from "./List";

export class ListItem {
  container: HTMLElement;
  element: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(data: ListItemElem): HTMLElement {
    this.element = $('.list-item');

    const title = $('.title');
    const span = $('span.icon');
    const itemIcon = $(`a.codicon codicon-${data.type}`);
    append(span, itemIcon);
    // console.log(span.outerHTML);
    // append(title, span);
    title.innerHTML = span.outerHTML + data.title;
    append(this.element, title);

    // append(this.container, this.element);
    return this.element;
  }
}