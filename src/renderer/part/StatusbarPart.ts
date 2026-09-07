import { STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part, PartOptions } from '../Part';
import { Service, setService, statusbarPartServiceId } from '../Service';
import { $ } from '../util/dom';

interface StatusbarPartOptions extends PartOptions {}

/** 상태바에 표시할 활성 터미널의 크기와 커서 위치. 커서는 화면 기준 1-based. */
export interface TerminalStatus {
  cols: number;
  rows: number;
  col: number;
  row: number;
}

export interface StatusbarPartService extends Service {
  updateTerminalStatus(status: TerminalStatus | undefined): void;
}

export class StatusbarPart extends Part implements StatusbarPartService {

  size_: HTMLElement;
  position_: HTMLElement;

  constructor(options: StatusbarPartOptions) {
    super(options);
    this.size = STATUSBAR_HEIGHT;
    this.sashEnablement = false;
    setService(statusbarPartServiceId, this);
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */

  override create(): void {
    super.create();
    const container = this.container; // super.createContentArea();

    /*
    <div class='size'></div>
    <div class='position'></div>
    */

    const leftItems = $('.left-items');
    const msgBox = $('.msg-box');
    // leftItems.appendChild(msgBox);

    const rightItems = $('.right-items');

    const position = this.position_ = $('div.position');
    const size = this.size_ = $('div.size');

    this.updateTerminalStatus(undefined);

    rightItems.appendChild(position);
    rightItems.appendChild(size);

    container.appendChild(leftItems);
    container.appendChild(rightItems);
    // return container;
  }

  /**
   * 활성 터미널의 크기와 커서 위치를 표시한다.
   * `undefined`를 넘기면 두 영역을 비운다(활성 터미널이 없는 경우).
   */
  updateTerminalStatus(status: TerminalStatus | undefined): void {
    if (!this.size_ || !this.position_) return;
    this.size_.textContent = status ? `Sz: ${status.cols}x${status.rows}` : '';
    this.position_.textContent = status ? `Pos: ${status.col},${status.row}` : '';
  }

}