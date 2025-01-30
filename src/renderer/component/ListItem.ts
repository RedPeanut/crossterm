import { $, append } from "../util/dom";
import { ListItemElem } from "./List";

export class ListItem {
  container: HTMLElement;
  element: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  create(data: ListItemElem): HTMLElement {
    this.element = $('.list-item');

    const title = $('.title');
    const span = $('span.icon');
    const codicon = data.type === 'folder' ? 'folder' :
      data.type === 'local' ? 'note' /* 'package' */ :
      data.type === 'remote' ? 'globe' : data.type;
    const itemIcon = $(`a.codicon.codicon-${codicon}`);
    append(span, itemIcon);
    // console.log(span.outerHTML);
    // append(title, span);
    title.innerHTML = span.outerHTML + data.title;
    append(this.element, title);

    // append(this.container, this.element);
    return this.element;
  }
}