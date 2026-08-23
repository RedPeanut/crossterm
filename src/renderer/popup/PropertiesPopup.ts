import { ListItemElem } from "../../common/Types";
import { Disposable } from "../../common/base/lifecycle";
import { Popup, PopupOptions } from "../Popup";
import { $, append, _addEventListener } from "../util/dom";
import * as dom from "../util/dom";

interface Node {
  label: string;
  children?: Node[];
  render?: (container: HTMLElement, data: Node) => void;
}

export interface PropertiesPopupOptions extends PopupOptions {
  title?: string;
  data?: ListItemElem;
}

export class PropertiesPopup extends Popup {

  readonly options: PropertiesPopupOptions;

  tree: HTMLElement;
  right: HTMLElement;

  okBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  applyBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, options: PropertiesPopupOptions = {}) {
    super(parent, { classList: ['properties'], ...options });
    this.options = options;
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    let title;
    if (this.options.data && this.options.data.title)
      title = this.options.data.title + ' 등록정보';
    else
      title = '등록정보';
    this.title.innerHTML = title; // this.options.data?.title ?? '등록 정보';
  }

  override renderContentArea(): void {
    super.renderContentArea();

    const contentArea = this.contentArea;

    // const body = $('.body');
    const categories = $('.categories');
    const label = $('label');
    label.textContent = '범주';
    categories.appendChild(label);

    const tree = this.tree = $('.tree');
    categories.appendChild(tree);
    const right = this.right = $('.right');
    this.renderTree();

    contentArea.appendChild(categories);
    contentArea.appendChild(right);
    // this.popup.appendChild(body);

    const buttons = $('.buttons');

    const okBtn: HTMLButtonElement = this.okBtn = $('button.primary'); okBtn.innerHTML = 'Ok';
    // okBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(okBtn, 'click', (e: MouseEvent) => this.close()));

    const cancelBtn: HTMLButtonElement = this.cancelBtn = $('button'); cancelBtn.innerHTML = 'Cancel';
    // cancelBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(cancelBtn, 'click', (e: MouseEvent) => this.close()));

    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);
    // buttons.appendChild(applyBtn);
    contentArea.appendChild(buttons);
  }

  renderTree() {
    const tree: Node[] = [
      {
        label: '연결',
        children: [
          {
            label: '사용자 인증',
            render: (container, data) => {
              const desc = append(container, $('.desc'));
              append(desc, $('p')).textContent = '인증 방법과 기타 관련 매개 변수들을 선택하십시오.';
              append(desc, $('p')).textContent = '이 섹션은 로그인 할 때 시간을 절약하기 위해 사용할 수 있습니다. 그러나 보안을 중요시하는 경우 이 섹션을 비워 두는 것이 좋습니다.';

              let row, input;

              row = append(container, $('.row'));
              append(row, $<HTMLLabelElement>('label')).textContent = '사용자 이름';
              input = append(row, $<HTMLInputElement>('input'));
              input.type = 'text';
              input.value = this.options.data.url.username;

              row = append(container, $('.row'));
              append(row, $<HTMLLabelElement>('label')).textContent = '암호';
              input = append(row, $<HTMLInputElement>('input'))
              input.type = 'password';
              input.value = this.options.data.url.password;
            }
          }
        ],
        render: (container, data) => {
          let row, input, select;

          row = append(container, $('.row'));
          append(row, $<HTMLLabelElement>('label')).textContent = '이름';
          input = append(row, $<HTMLInputElement>('input'));
          input.type = 'text';
          input.value = this.options.data.title;

          row = append(container, $('.row'));
          append(row, $<HTMLLabelElement>('label')).textContent = '프로토콜';
          select = append(row, $<HTMLSelectElement>('select'))
          // input.type = 'text';

          row = append(container, $('.row'));
          append(row, $<HTMLLabelElement>('label')).textContent = '호스트';
          input = append(row, $<HTMLInputElement>('input'))
          input.type = 'text';
          input.value = this.options.data.url.host;

          row = append(container, $('.row'));
          append(row, $<HTMLLabelElement>('label')).textContent = '포트 번호';
          input = append(row, $<HTMLInputElement>('input'));
          input.type = 'number';
          input.value = this.options.data.url.port;
        }
      }
    ];

    this.addNodes(this.tree, tree, 0, '');
    this.callRenders(tree, 0, '', null);
    (this.tree.getElementsByClassName('content')[0] as HTMLElement).click();
  }

  callRender(data: Node, level: number, id: string, breadcrumb: string): void {
    const container = $('.container');
    container.id = id;

    // const title = $('h2.title.breadcrumb');
    // title.innerHTML = data.label;
    // container.appendChild(title);

    const _breadcrumb = $('p.breadcrumb');
    _breadcrumb.innerHTML = breadcrumb;
    container.appendChild(_breadcrumb);

    if (data.render) data.render(container, data);

    container.style.display = 'none';
    this.right.appendChild(container);
  }

  callRenders(list: Node[], level: number, id: string, breadcrumb: string): void {
    for (let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if (_id.startsWith('-')) _id = _id.substring(1);
      let _breadcrumb;
      if (!breadcrumb)
        _breadcrumb = list[i].label;
      else
        _breadcrumb = breadcrumb + ' > ' + list[i].label;

      this.callRender(list[i], level, _id, _breadcrumb);
      if (list[i].children) {
        this.callRenders(list[i].children, level+1, _id, _breadcrumb);
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
      for (let i = 0; i < contents.length; i++) {
        if (contents[i].classList.contains('selected'))
          contents[i].classList.remove('selected');
      }
      content.classList.add('selected');

      const containers = this.right.getElementsByClassName('container');
      for (let i = 0; i < containers.length; i++) {
        const container = containers[i] as HTMLElement;
        if (container.id == id)
          container.style.display = 'block';
        else
          container.style.display = 'none';
      }
    };

    this._register(_addEventListener(content, 'click', onClick));

    if (level != 0) {
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
    for (let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if (_id.startsWith('-')) _id = _id.substring(1);

      const node = this.addNode(container, list[i], level, _id);
      if (list[i].children) {
        this.addNodes(node, list[i].children, level+1, _id);
      }

      if (i == list.length-1 && level != 0) {
        const header_down = node.getElementsByClassName('down')[0] as HTMLElement;
        if (header_down) {
          // console.log('header_down =', header_down);
          header_down.style.display = 'none';
        }
      }
    }
  }
}
