import { IDisposable } from "../../../common/base/lifecycle";
import { $ } from "../../util/dom";

/** 크기 표시가 화면에 유지되는 시간(ms). */
const resizeOverlayHideDelay = 1000;
const visibleClass = 'visible';

/**
 * 터미널 크기가 바뀔 때 컨테이너 가운데에 `cols x rows`를 잠시 띄우는 오버레이.
 * VS Code의 터미널 리사이즈 표시와 동일한 동작이다.
 */
export class TermResizeOverlay implements IDisposable {

  private element: HTMLElement | null = null;
  private hideTimeout: number | undefined;

  /** @param container 오버레이를 띄울 컨테이너. `position: relative | absolute`여야 한다. */
  constructor(private readonly container: HTMLElement) { }

  /** 지정한 크기를 가운데에 표시하고, 잠시 후 스스로 사라진다. */
  show(cols: number, rows: number): void {
    if (!this.container.isConnected) return;

    const element = this.ensureElement();
    element.textContent = `${cols} x ${rows}`;
    element.classList.add(visibleClass);

    // 연속 리사이즈 중에는 마지막 변경 시점 기준으로 다시 시간을 잰다.
    clearTimeout(this.hideTimeout);
    this.hideTimeout = window.setTimeout(() => {
      this.element?.classList.remove(visibleClass);
    }, resizeOverlayHideDelay);
  }

  private ensureElement(): HTMLElement {
    if (!this.element) {
      this.element = $('.resize-overlay');
      this.element.setAttribute('role', 'status');
      this.element.setAttribute('aria-live', 'polite');
    }
    if (!this.container.contains(this.element)) {
      this.container.appendChild(this.element);
    }
    return this.element;
  }

  dispose(): void {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = undefined;
    this.element?.remove();
    this.element = null;
  }
}
