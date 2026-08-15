import { Disposable } from "../../common/base/lifecycle";
import { Popup, PopupOptions } from "../Popup";
import { $, _addEventListener } from "../util/dom";
import * as dom from "../util/dom";

interface Node {
  label: string;
  children?: Node[];
  render?: (container: HTMLElement, data: Node) => void;
}

export interface PropertiesPopupOptions extends PopupOptions {
  title?: string;
}

export class PropertiesPopup extends Popup {

  readonly options: PropertiesPopupOptions;

  tree: HTMLElement;
  content: HTMLElement;

  okBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  applyBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, options: PropertiesPopupOptions = {}) {
    super(parent, options);
    this.options = options;
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    this.title.innerHTML = this.options.title ?? '등록 정보';
  }

  override renderContentArea(): void {
    super.renderContentArea();

    const contentArea = this.contentArea;

    // const body = $('.body');
    const tree = this.tree = $('.tree');
    const content = this.content = $('.content');
    this.renderTree();

    contentArea.appendChild(tree);
    contentArea.appendChild(content);
    // this.popup.appendChild(body);

    const buttons = $('.buttons');

    const okBtn: HTMLButtonElement = this.okBtn = $('button'); okBtn.innerHTML = 'Ok';
    // okBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(okBtn, 'click', (e: MouseEvent) => {}));

    const cancelBtn: HTMLButtonElement = this.cancelBtn = $('button'); cancelBtn.innerHTML = 'Cancel';
    // cancelBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(cancelBtn, 'click', (e: MouseEvent) => {}));

    const applyBtn: HTMLButtonElement = this.applyBtn = $('button'); applyBtn.innerHTML = 'Apply'; applyBtn.disabled = true;
    // applyBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(applyBtn, 'click', (e: MouseEvent) => {}));

    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);
    buttons.appendChild(applyBtn);
    contentArea.appendChild(buttons);
  }

  renderTree() {
    const tree: Node[] = [
      {
        label: '연결',
        children: [
          {
            label: '사용자 정보',
            render: function(container, data) {
              let p = $('p');
              container.appendChild(p);
            }
          }
        ],
        render: function(container, data) {
          let p = $('p');
          container.appendChild(p);
        }
      }
    ];

    this.addNodes(this.tree, tree, 0, '');
    this.callRenders(tree, 0, '');
    (this.tree.getElementsByClassName('content')[0] as HTMLElement).click();
  }

  callRender(data: Node, level: number, id: string): void {
    const container = $('.container');
    container.id = id;

    const title = $('h2.title');
    title.innerHTML = data.label;
    container.appendChild(title);

    if(data.render) data.render(container, data);

    container.style.display = 'none';
    this.content.appendChild(container);
  }

  callRenders(list: Node[], level: number, id: string): void {
    for(let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if(_id.startsWith('-')) _id = _id.substring(1);

      this.callRender(list[i], level, _id);
      if(list[i].children) {
        this.callRenders(list[i].children, level+1, _id);
      }
    }
  }

  addNode(container: HTMLElement, data: Node, level: number, id: string): HTMLElement {
    const hasChildren = data.children && data.children.length > 0, isCollapsed = false;
    const node = $(".node");

    node.style.marginLeft = `${level*10}px`;
    const content = $(".content");
    const body = $(".ln-body");
    body.innerHTML = data.label;

    const onClick = (e: MouseEvent) => {
      const contents = this.tree.getElementsByClassName('content');
      for(let i = 0; i < contents.length; i++) {
        if(contents[i].classList.contains('selected'))
          contents[i].classList.remove('selected');
      }
      content.classList.add('selected');

      const containers = this.content.getElementsByClassName('container');
      for(let i = 0; i < containers.length; i++) {
        const container = containers[i] as HTMLElement;
        if(container.id == id)
          container.style.display = 'block';
        else
          container.style.display = 'none';
      }
    };

    this._register(_addEventListener(content, 'click', onClick));

    if(level != 0) {
      const up = $(".up");
      const down = $(".down");
      const header = $(".ln-header");
      header.appendChild(up);
      header.appendChild(down);
      content.appendChild(header);
    }

    content.appendChild(body);
    node.appendChild(content);
    container.appendChild(node);
    return node;
  }

  addNodes(container: HTMLElement, list: Node[], level: number, id: string): void {
    for(let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if(_id.startsWith('-')) _id = _id.substring(1);

      const node = this.addNode(container, list[i], level, _id);
      if(list[i].children) {
        this.addNodes(node, list[i].children, level+1, _id);
      }

      if(i == list.length-1 && level != 0) {
        const header_down = node.getElementsByClassName('down')[0] as HTMLElement;
        if(header_down) {
          // console.log('header_down =', header_down);
          header_down.style.display = 'none';
        }
      }
    }
  }
}
