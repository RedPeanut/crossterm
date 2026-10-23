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
  // title?: string;
  items: ListItemElem[];
  /** 확인 시 변경 내용이 적용된 복사본을 넘긴다 (원본 items 는 바꾸지 않는다) */
  onOk?: (items: ListItemElem[]) => void;
}

enum Mode { SINGLE, MULTI }

/** 다중 선택 시 세션마다 값이 다른 필드에 표시하는 값 */
const MIXED_VALUE = '###';

interface Field {
  get: (item: ListItemElem) => string;
  set: (item: ListItemElem, value: string) => void;
}

type FieldInput = HTMLInputElement | HTMLSelectElement;

interface BoundField {
  field: Field;
  input: FieldInput;
  label: HTMLLabelElement;
  initial: string;
  mixed: boolean;
  dirty: boolean;
}

function ensureUrl(item: ListItemElem): NonNullable<ListItemElem['url']> {
  if (!item.url) item.url = { host: '', port: 0, username: '', password: '' };
  return item.url;
}

const fields = {
  title: { get: item => item.title ?? '', set: (item, v) => item.title = v } as Field,
  type: { get: item => item.type === 'local' ? 'local' : 'remote', set: (item, v) => item.type = v as ListItemElem['type'] } as Field,
  host: { get: item => item.url?.host ?? '', set: (item, v) => ensureUrl(item).host = v } as Field,
  port: { get: item => item.url?.port != null ? String(item.url.port) : '', set: (item, v) => ensureUrl(item).port = Number(v) } as Field,
  username: { get: item => item.url?.username ?? '', set: (item, v) => ensureUrl(item).username = v } as Field,
  password: { get: item => item.url?.password ?? '', set: (item, v) => ensureUrl(item).password = v } as Field,
};

export class PropertiesPopup extends Popup {

  readonly options: PropertiesPopupOptions;

  tree: HTMLElement;
  right: HTMLElement;

  okBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  applyBtn: HTMLButtonElement;

  mode: Mode;

  readonly boundFields: BoundField[] = [];

  constructor(parent: HTMLElement, options: PropertiesPopupOptions) {
    super(parent, { classList: ['properties'], ...options });
    this.options = { classList: ['properties'], ...options };
    this.mode = this.options.items.length > 1 ? Mode.MULTI : Mode.SINGLE;
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    let title;

    if (this.mode === Mode.MULTI)
      title = `다중 세션 등록정보 (${this.options.items.length})`;
    else
      title = this.options.items[0].title + ' 등록정보';
    this.title.innerHTML = title;
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
    this._register(_addEventListener(okBtn, 'click', (e: MouseEvent) => this.ok()));

    const cancelBtn: HTMLButtonElement = this.cancelBtn = $('button'); cancelBtn.innerHTML = 'Cancel';
    // cancelBtn.addEventListener('click', (e: Event) => {});
    this._register(_addEventListener(cancelBtn, 'click', (e: MouseEvent) => this.close()));

    buttons.appendChild(okBtn);
    buttons.appendChild(cancelBtn);
    // buttons.appendChild(applyBtn);
    contentArea.appendChild(buttons);
  }

  /**
   * 선택된 세션들의 값을 필드에 표시하고 편집 여부를 추적한다.
   * - 값이 모두 같으면 그 값을, 다르면 '###'을 표시
   * - 초기값과 달라지면 라벨에 '*' 표시 (.modified)
   */
  bindField(field: Field, label: HTMLLabelElement, input: FieldInput): void {
    const values = this.options.items.map(item => field.get(item));
    const mixed = values.some(v => v !== values[0]);
    const initial = mixed ? MIXED_VALUE : values[0];

    if (mixed && input instanceof HTMLSelectElement) {
      const option = $<HTMLOptionElement>('option');
      option.value = MIXED_VALUE;
      option.textContent = MIXED_VALUE;
      input.insertBefore(option, input.firstChild);
    }
    input.value = initial;

    const bound: BoundField = { field, input, label, initial, mixed, dirty: false };
    this.boundFields.push(bound);

    if (mixed && input instanceof HTMLInputElement) {
      // 아직 편집하지 않은 '###'은 포커스 시 전체 선택해 바로 덮어쓸 수 있게 한다
      this._register(_addEventListener(input, 'focus', () => {
        if (!bound.dirty) input.select();
      }));
    }

    const onEdit = () => {
      bound.dirty = input.value !== initial;
      label.classList.toggle('modified', bound.dirty);
    };
    this._register(_addEventListener(input, input instanceof HTMLSelectElement ? 'change' : 'input', onEdit));
  }

  override ok(): void {
    const dirtyFields = this.boundFields.filter(v => v.dirty);
    if (dirtyFields.length > 0) {
      const items = this.options.items.map(item => ({ ...item, url: item.url && { ...item.url } }));
      for (const { field, input } of dirtyFields) {
        for (const item of items)
          field.set(item, input.value);
      }
      this.options.onOk?.(items);
    }
    super.ok();
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

              let row, label, input;

              row = append(container, $('.row'));
              label = append(row, $<HTMLLabelElement>('label')); label.textContent = '사용자 이름';
              input = append(row, $<HTMLInputElement>('input'));
              input.type = 'text';
              this.bindField(fields.username, label, input);

              row = append(container, $('.row'));
              label = append(row, $<HTMLLabelElement>('label')); label.textContent = '암호';
              input = append(row, $<HTMLInputElement>('input'))
              input.type = 'password';
              this.bindField(fields.password, label, input);
            }
          }
        ],
        render: (container, data: Node) => {
          let row, label, input, select, option;

          row = append(container, $('.row'));
          label = append(row, $<HTMLLabelElement>('label')); label.textContent = '이름';
          input = append(row, $<HTMLInputElement>('input'));
          input.type = 'text';
          if (this.mode === Mode.MULTI) {
            // 다중 선택 시 이름은 일괄 변경하지 않는다
            input.value = '다중 세션 등록 정보';
            input.disabled = true;
          } else {
            this.bindField(fields.title, label, input);
          }

          row = append(container, $('.row'));
          label = append(row, $<HTMLLabelElement>('label')); label.textContent = '프로토콜';
          select = append(row, $<HTMLSelectElement>('select'))

          option = append(select, $<HTMLOptionElement>('option'));
          option.value = 'remote';
          option.textContent = 'SSH';
          option = append(select, $<HTMLOptionElement>('option'));
          option.value = 'local';
          option.textContent = 'LOCAL';

          this.bindField(fields.type, label, select);
          const protocolSelect = select;

          // 다중 선택에 로컬과 SSH 세션이 섞여 있으면 프로토콜을 일괄 변경하지 않는다
          const types: string[] = this.options.items.map(item => fields.type.get(item));
          const lockProtocol: boolean = types.includes('local') && types.some(t => t !== 'local');
          protocolSelect.disabled = lockProtocol;

          row = append(container, $('.row'));
          label = append(row, $<HTMLLabelElement>('label')); label.textContent = '호스트';
          input = append(row, $<HTMLInputElement>('input'))
          input.type = 'text';
          this.bindField(fields.host, label, input);
          const hostInput = input;

          row = append(container, $('.row'));
          label = append(row, $<HTMLLabelElement>('label')); label.textContent = '포트 번호';
          input = append(row, $<HTMLInputElement>('input'));
          // '###' 표시를 위해 number 대신 text + 숫자 필터 사용
          input.type = 'text';
          input.inputMode = 'numeric';
          const portInput = input;
          this._register(_addEventListener(portInput, 'input', () => {
            const digits = portInput.value.replace(/\D/g, '');
            if (digits !== portInput.value) portInput.value = digits;
          }));
          this.bindField(fields.port, label, input);

          // 로컬 세션은 호스트, 포트 번호를 사용하지 않으므로 비활성화
          const updateRemoteFields = () => {
            const isLocal = lockProtocol || protocolSelect.value === 'local';
            hostInput.disabled = isLocal;
            portInput.disabled = isLocal;
          };
          this._register(_addEventListener(protocolSelect, 'change', updateRemoteFields));
          updateRemoteFields();
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
