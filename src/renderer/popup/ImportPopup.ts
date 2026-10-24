import { Popup, PopupOptions } from "../Popup";
import { $, append, _addEventListener } from "../util/dom";

/** 결과창에 한 줄씩 기록한다 */
export type ImportLogger = (line: string) => void;

/** 가져올 대상에 같은 이름의 파일이 이미 있을 때 */
export type ImportExistOption = 'overwrite' | 'ignore' | 'rename';

/** 원본 파일에 들어 있는 항목 (2번째 페이지 목록의 한 줄) */
export interface ImportItem {
  id: string;
  name: string;
  type: string;
  count: number;
}

export interface ImportPopupOptions extends PopupOptions {
  /** 원본 파일을 읽어 가져올 수 있는 항목을 돌려준다 */
  onLoad: (filePath: string) => Promise<ImportItem[]>;
  /** 실제 가져오기. 진행 내용은 log 로 결과창에 남긴다 */
  onImport: (filePath: string, itemIds: string[], onExist: ImportExistOption, log: ImportLogger) => Promise<void>;
}

enum Page { SOURCE, ITEMS, RESULT }

enum State { IDLE, LOADING, CONFIRMING, RUNNING, DONE }

const existOptions: { value: ImportExistOption, label: string }[] = [
  { value: 'overwrite', label: 'Overwrite' }, // '덮어쓰기'
  { value: 'ignore', label: 'Ignore' },       // '무시'
  { value: 'rename', label: 'Rename' },       // '이름 바꾸기'
];

/**
 * 가져오기 마법사.
 *  1. 원본 파일 선택, 파일이 존재하는 경우 처리 방법
 *  2. 가져올 항목 선택 (다음 누르면 확인 메시지박스)
 *  3. 결과 (가져온 항목 로그)
 */
export class ImportPopup extends Popup {

  readonly options: ImportPopupOptions;

  page: Page = Page.SOURCE;
  state: State = State.IDLE;

  /** onLoad 로 읽어 온 원본 경로. 원본이 바뀌면 다시 읽는다 */
  loadedPath: string = null;
  items: ImportItem[] = [];

  sourcePage: HTMLElement;
  itemsPage: HTMLElement;
  resultPage: HTMLElement;
  fileInput: HTMLInputElement;
  existInputs: HTMLInputElement[] = [];
  sourcePathLabel: HTMLElement;
  itemsBody: HTMLElement;
  itemChecks: HTMLInputElement[] = [];
  logArea: HTMLElement;

  prevBtn: HTMLButtonElement;
  nextBtn: HTMLButtonElement;
  finishBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, options: ImportPopupOptions) {
    super(parent, { classList: ['wizard', 'import'], ...options });
    this.options = { classList: ['wizard', 'import'], ...options };
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    this.title.innerHTML = 'Import'; // '가져오기'
  }

  override renderContentArea(): void {
    super.renderContentArea();

    const contentArea = this.contentArea;
    this.renderSourcePage(contentArea);
    this.renderItemsPage(contentArea);
    this.renderResultPage(contentArea);

    const footer = append(this.popup, $('.footer'));
    const prevBtn = this.prevBtn = append(footer, $<HTMLButtonElement>('button')); prevBtn.textContent = '< Back';
    const nextBtn = this.nextBtn = append(footer, $<HTMLButtonElement>('button.primary')); nextBtn.textContent = 'Next >';
    const finishBtn = this.finishBtn = append(footer, $<HTMLButtonElement>('button')); finishBtn.textContent = 'Finish';
    const cancelBtn = this.cancelBtn = append(footer, $<HTMLButtonElement>('button')); cancelBtn.textContent = 'Cancel';

    this._register(_addEventListener(prevBtn, 'click', () => this.prev()));
    this._register(_addEventListener(nextBtn, 'click', () => this.next()));
    this._register(_addEventListener(finishBtn, 'click', () => this.finish()));
    this._register(_addEventListener(cancelBtn, 'click', () => this.cancel()));

    this.showPage(Page.SOURCE);
  }

  renderSourcePage(container: HTMLElement): void {
    const page = this.sourcePage = append(container, $('.page.source'));

    const label = append(page, $<HTMLLabelElement>('label')); label.textContent = 'Source file:'; // '원본 위치:'
    const row = append(page, $('.row'));

    const input = this.fileInput = append(row, $<HTMLInputElement>('input'));
    input.type = 'text';
    this._register(_addEventListener(input, 'input', () => this.updateButtons()));

    const browseBtn = append(row, $<HTMLButtonElement>('button.browse')); browseBtn.textContent = '...';
    this._register(_addEventListener(browseBtn, 'click', () => this.browse()));

    const fieldset = append(page, $<HTMLFieldSetElement>('fieldset'));
    append(fieldset, $('legend')).textContent = 'If the file exists'; // '파일이 존재하는 경우'
    for (const { value, label } of existOptions) {
      const radioLabel = append(fieldset, $<HTMLLabelElement>('label'));
      const radio = append(radioLabel, $<HTMLInputElement>('input'));
      radio.type = 'radio';
      radio.name = 'import-exist';
      radio.value = value;
      radio.checked = value === 'ignore';
      append(radioLabel, $('span')).textContent = label;
      this.existInputs.push(radio);
    }
  }

  renderItemsPage(container: HTMLElement): void {
    const page = this.itemsPage = append(container, $('.page.items-page'));

    const pathRow = append(page, $('.row'));
    append(pathRow, $<HTMLLabelElement>('label')).textContent = 'Source:'; // '원본 경로:'
    this.sourcePathLabel = append(pathRow, $('span.source-path'));

    const table = append(append(page, $('.items')), $<HTMLTableElement>('table'));
    const headRow = append(append(table, $('thead')), $('tr'));
    append(headRow, $('th')).textContent = 'Source';  // '원본'
    append(headRow, $('th')).textContent = 'Type';    // '종류'
    append(headRow, $('th.count')).textContent = 'Count'; // '개수'
    this.itemsBody = append(table, $('tbody'));
  }

  renderResultPage(container: HTMLElement): void {
    const page = this.resultPage = append(container, $('.page.result'));

    const label = append(page, $<HTMLLabelElement>('label')); label.textContent = 'Result:'; // '결과:'
    this.logArea = append(page, $('.log'));
  }

  renderItems(): void {
    this.itemsBody.textContent = '';
    this.itemChecks = [];

    for (const item of this.items) {
      const tr = append(this.itemsBody, $('tr'));
      const label = append(append(tr, $('td')), $<HTMLLabelElement>('label'));
      const check = append(label, $<HTMLInputElement>('input'));
      check.type = 'checkbox';
      check.checked = true;
      check.value = item.id;
      this._register(_addEventListener(check, 'change', () => this.updateButtons()));
      append(label, $('span')).textContent = item.name;
      append(tr, $('td')).textContent = item.type;
      append(tr, $('td.count')).textContent = String(item.count);
      this.itemChecks.push(check);
    }
  }

  showPage(page: Page): void {
    this.page = page;
    this.sourcePage.style.display = page === Page.SOURCE ? '' : 'none';
    this.itemsPage.style.display = page === Page.ITEMS ? '' : 'none';
    this.resultPage.style.display = page === Page.RESULT ? '' : 'none';
    this.updateButtons();
    if (page === Page.SOURCE) this.fileInput.focus();
  }

  updateButtons(): void {
    const idle = this.state === State.IDLE;
    const onResult = this.page === Page.RESULT;

    this.prevBtn.disabled = !idle || this.page !== Page.ITEMS; // 결과 페이지에서는 돌아갈 일이 없다
    this.nextBtn.disabled = !idle || onResult || !this.canNext();
    this.finishBtn.disabled = this.state !== State.DONE;
    this.cancelBtn.disabled = !idle;

    this.nextBtn.classList.toggle('primary', !onResult);
    this.finishBtn.classList.toggle('primary', onResult);
  }

  canNext(): boolean {
    if (this.page === Page.SOURCE) return this.fileInput.value.trim() !== '';
    if (this.page === Page.ITEMS) return this.itemChecks.some(c => c.checked);
    return false;
  }

  get existOption(): ImportExistOption {
    return (this.existInputs.find(r => r.checked)?.value ?? 'ignore') as ImportExistOption;
  }

  async browse(): Promise<void> {
    const { canceled, filePaths } = await window.ipc.invoke('dialog show opendialog', {
      title: 'Import',
      defaultPath: this.fileInput.value.trim() || undefined,
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled || !filePaths?.length) return;

    this.fileInput.value = filePaths[0];
    this.updateButtons();
  }

  prev(): void {
    if (this.page !== Page.ITEMS || this.prevBtn.disabled) return;
    this.showPage(Page.SOURCE);
  }

  async next(): Promise<void> {
    if (this.nextBtn.disabled) return;

    if (this.page === Page.SOURCE) await this.load();
    else if (this.page === Page.ITEMS) await this.confirmAndImport();
  }

  /** 1 -> 2: 원본 파일을 읽어 항목 목록을 채운다 */
  async load(): Promise<void> {
    const filePath = this.fileInput.value.trim();
    if (filePath !== this.loadedPath) {
      this.state = State.LOADING;
      this.updateButtons();
      try {
        this.items = await this.options.onLoad(filePath);
        this.loadedPath = filePath;
      } catch (err) {
        await window.ipc.invoke('dialog show messagebox', {
          type: 'error',
          title: 'Import',
          message: `Cannot read ${filePath}`,
          detail: err instanceof Error ? err.message : String(err),
        });
        return;
      } finally {
        this.state = State.IDLE;
        this.updateButtons();
      }
      this.renderItems();
    }

    this.sourcePathLabel.textContent = filePath;
    this.sourcePathLabel.title = filePath;
    this.showPage(Page.ITEMS);
    this.nextBtn.focus();
  }

  /** 2 -> 3: 확인 메시지박스를 띄우고, 예 이면 가져온다 */
  async confirmAndImport(): Promise<void> {
    this.state = State.CONFIRMING;
    this.updateButtons();
    const { response } = await window.ipc.invoke('dialog show messagebox', {
      type: 'question',
      title: 'Import',
      // '내보내기한 컴퓨터와 동일 컴퓨터가 아니면 세션 암호를 사용할 수 없습니다. 가져오기를 계속하시겠습니까?'
      message: 'Session passwords cannot be used unless this is the same computer the data was exported from.',
      detail: 'Do you want to continue importing?',
      buttons: ['Yes', 'No'],
      defaultId: 0,
      cancelId: 1,
    });
    this.state = State.IDLE;
    if (response !== 0) {
      this.updateButtons();
      this.nextBtn.focus();
      return;
    }

    const filePath = this.loadedPath;
    const itemIds = this.itemChecks.filter(c => c.checked).map(c => c.value);
    this.state = State.RUNNING;
    this.showPage(Page.RESULT);
    this.popup.focus(); // Enter/Escape 를 계속 받도록

    this.log('=== BEGIN ===');
    try {
      await this.options.onImport(filePath, itemIds, this.existOption, line => this.log(line));
    } catch (err) {
      this.log('');
      this.log(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    this.log('');
    this.log('=== END ===');

    this.state = State.DONE;
    this.updateButtons();
    this.finishBtn.focus();
  }

  log(line: string): void {
    append(this.logArea, $('div')).textContent = line || ' ';
    this.logArea.scrollTop = this.logArea.scrollHeight;
  }

  /** Enter: 1, 2 페이지에서는 다음, 완료 후에는 마침 */
  override ok(): void {
    // 버튼, 라디오, 체크박스에 포커스가 있으면 Enter 는 그 요소에 맡긴다
    const active = document.activeElement;
    if (active instanceof HTMLButtonElement) return;
    if (active instanceof HTMLInputElement && active.type !== 'text') return;

    if (this.page === Page.RESULT) this.finish();
    else this.next();
  }

  finish(): void {
    if (this.state === State.DONE) super.ok();
  }

  /** 읽는 중, 확인 중, 가져오는 중에는 닫지 않는다 */
  override cancel(): void {
    if (this.state !== State.IDLE && this.state !== State.DONE) return;
    super.cancel();
  }
}
