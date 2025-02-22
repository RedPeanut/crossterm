import { bookmarkPanelServiceId, getService } from "../Service";
import { $, append } from "../util/dom";
import { ListItemElem } from "./List";
// import { TreeNodeData } from "./Tree";

export class Node {
  container: HTMLElement;

  element: HTMLElement;
  node: HTMLElement;
  children: Node[];
  id: string;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  create(
    data: ListItemElem,
    level: number = 0,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
    onSelect: (id: string) => void,
    onDoubleClick: (id: string) => void,
    selectedIds
  ): void {
    this.id = data.id;

    const isSelected = selectedIds.includes(data.id);
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;
    const isCollapsed = data.isCollapsed == null || data.isCollapsed == undefined
      ? true : data.isCollapsed;

    const wrapper = this.element = $('.wrapper');
    const node = this.node = $('.node');

    node.style.paddingLeft = `${level * 20 + 4}px`;

    node.onclick = (e) => {
      onSelect(data.id);
      const bookmarkPanelService = getService(bookmarkPanelServiceId);
      bookmarkPanelService.onSelect(data.id);
    };
    node.ondblclick = (e) => onDoubleClick(data.id);

    const content = $('.content');
    const header = $('.ln-header');
    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) wrapper.classList.add('collapsed');
      arrow.onclick = (e) => {
        // onChange(data.id, { isCollapsed: !isCollapsed });
        wrapper.classList.toggle('collapsed');
      };

      const collapseArrow = $('a.codicon.codicon-chevron-right');
      if(collapseArrow)
        arrow.appendChild(collapseArrow);
      else
        arrow.innerHTML = '>';

      header.append(arrow);
    }
    content.append(header);

    const body = $('.ln-body');
    const listItem = nodeRender ? nodeRender(data) : data.title || `node#${data.id}`;
    body.append(listItem);
    content.append(body);

    append(node, content);
    append(wrapper, node);

    if(hasChildren) {
      this.children = [];
      data.children.map((e) => {
        const _node = new Node(wrapper);
        _node.create(e, level+1, nodeRender, onSelect, onDoubleClick, selectedIds);
        this.children.push(_node);
      });
    }

    append(this.container, wrapper);
  }
}