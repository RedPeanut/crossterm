import { localize } from '../../common/nls';
import { Popup, PopupOptions } from '../Popup';
import { $, append, _addEventListener } from '../util/dom';

/** 결과창에 한 줄씩 기록한다 */
export type ExportLogger = (line: string) => void;

export interface ExportPopupOptions extends PopupOptions {
  /** 실제 내보내기. 진행 내용은 log 로 결과창에 남긴다 */
  onExport: (filePath: string, log: ExportLogger) => Promise<void>;
}

enum Page { TARGET, RESULT }

enum State { IDLE, RUNNING, DONE }

function defaultFileName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `crossterm-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
}

/**
 * 내보내기 마법사.
 *  1. 대상 파일 선택
 *  2. 결과 (내보낸 항목 로그)
 */
export class ExportPopup extends Popup {

  readonly options: ExportPopupOptions;

  page: Page = Page.TARGET;
  state: State = State.IDLE;

  targetPage: HTMLElement;
  resultPage: HTMLElement;
  fileInput: HTMLInputElement;
  logArea: HTMLElement;

  prevBtn: HTMLButtonElement;
  nextBtn: HTMLButtonElement;
  finishBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, options: ExportPopupOptions) {
    super(parent, { classList: ['wizard', 'export'], ...options });
    this.options = { classList: ['wizard', 'export'], ...options };
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    this.title.textContent = localize('export.title', 'Export');
  }

  override renderContentArea(): void {
    super.renderContentArea();

    const contentArea = this.contentArea;
    this.renderTargetPage(contentArea);
    this.renderResultPage(contentArea);

    const footer = append(this.popup, $('.footer'));
    const prevBtn = this.prevBtn = append(footer, $<HTMLButtonElement>('button')); prevBtn.textContent = localize('wizard.back', '< Back');
    const nextBtn = this.nextBtn = append(footer, $<HTMLButtonElement>('button.primary')); nextBtn.textContent = localize('wizard.next', 'Next >');
    const finishBtn = this.finishBtn = append(footer, $<HTMLButtonElement>('button')); finishBtn.textContent = localize('wizard.finish', 'Finish');
    const cancelBtn = this.cancelBtn = append(footer, $<HTMLButtonElement>('button')); cancelBtn.textContent = localize('common.cancel', 'Cancel');

    this._register(_addEventListener(prevBtn, 'click', () => this.showPage(Page.TARGET)));
    this._register(_addEventListener(nextBtn, 'click', () => this.next()));
    this._register(_addEventListener(finishBtn, 'click', () => this.finish()));
    this._register(_addEventListener(cancelBtn, 'click', () => this.cancel()));

    this.showPage(Page.TARGET);
  }

  renderTargetPage(container: HTMLElement): void {
    const page = this.targetPage = append(container, $('.page.target'));

    const label = append(page, $<HTMLLabelElement>('label')); label.textContent = localize('export.targetFile', 'Target file:');
    const row = append(page, $('.row'));

    const input = this.fileInput = append(row, $<HTMLInputElement>('input'));
    input.type = 'text';
    input.placeholder = defaultFileName();
    this._register(_addEventListener(input, 'input', () => this.updateButtons()));

    const browseBtn = append(row, $<HTMLButtonElement>('button.browse')); browseBtn.textContent = '...';
    this._register(_addEventListener(browseBtn, 'click', () => this.browse()));
  }

  renderResultPage(container: HTMLElement): void {
    const page = this.resultPage = append(container, $('.page.result'));

    const label = append(page, $<HTMLLabelElement>('label')); label.textContent = localize('wizard.result', 'Result:');
    this.logArea = append(page, $('.log'));
  }

  showPage(page: Page): void {
    this.page = page;
    this.targetPage.style.display = page === Page.TARGET ? '' : 'none';
    this.resultPage.style.display = page === Page.RESULT ? '' : 'none';
    this.updateButtons();
    if (page === Page.TARGET) this.fileInput.focus();
  }

  updateButtons(): void {
    const onTarget = this.page === Page.TARGET;
    this.prevBtn.disabled = true; // 결과 페이지에서 돌아갈 일이 없으므로 항상 비활성
    this.nextBtn.disabled = !onTarget || this.fileInput.value.trim() === '';
    this.finishBtn.disabled = this.state !== State.DONE;
    this.cancelBtn.disabled = this.state !== State.IDLE;

    this.nextBtn.classList.toggle('primary', onTarget);
    this.finishBtn.classList.toggle('primary', !onTarget);
  }

  async browse(): Promise<void> {
    const { canceled, filePath } = await window.ipc.invoke('dialog show savedialog', {
      title: localize('export.title', 'Export'),
      defaultPath: this.fileInput.value.trim() || defaultFileName(),
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled || !filePath) return;

    this.fileInput.value = filePath;
    this.updateButtons();
  }

  async next(): Promise<void> {
    if (this.page !== Page.TARGET || this.nextBtn.disabled) return;

    const filePath = this.fileInput.value.trim();
    this.state = State.RUNNING;
    this.showPage(Page.RESULT);
    this.popup.focus(); // Enter/Escape 를 계속 받도록

    this.log('=== BEGIN ===');
    try {
      await this.options.onExport(filePath, line => this.log(line));
    } catch (err) {
      this.log('');
      this.log(localize('wizard.error', 'Error: {0}', err instanceof Error ? err.message : String(err)));
    }
    this.log('');
    this.log('=== END ===');

    this.state = State.DONE;
    this.updateButtons();
    this.finishBtn.focus();
  }

  log(line: string): void {
    append(this.logArea, $('div')).textContent = line || ' ';
    this.logArea.scrollTop = this.logArea.scrollHeight;
  }

  /** Enter: 대상 페이지에서는 다음, 완료 후에는 마침 */
  override ok(): void {
    // 버튼에 포커스가 있으면 Enter 는 그 버튼의 click 으로 처리된다
    if (document.activeElement instanceof HTMLButtonElement) return;

    if (this.page === Page.TARGET) this.next();
    else this.finish();
  }

  finish(): void {
    if (this.state === State.DONE) super.ok();
  }

  /** 내보내는 중에는 닫지 않는다 */
  override cancel(): void {
    if (this.state === State.RUNNING) return;
    super.cancel();
  }
}
