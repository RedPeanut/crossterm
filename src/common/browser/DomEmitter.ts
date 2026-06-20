import { Emitter, Event as BaseEvent } from "../base/event";
import { IDisposable } from "../base/lifecycle";

/*
export class DOMEmitter<T> implements IDisposable {
  private readonly _emitter = new Emitter<T>();
  readonly event: BaseEvent<T> = this._emitter.event;

  constructor(element: HTMLElement, eventType: string, reducer: (e: Event) => T) {
    const listener = (e: Event) => {
      // DOM 이벤트를 받아서 원하는 데이터 형태로 변환 후 내부 Emitter로 방출
      this._emitter.fire(reducer(e));
    };

    element.addEventListener(eventType, listener);

    // 나중에 dispose() 호출 시 리스너가 깔끔하게 제거되도록 설정
    this._disposable = {
      dispose: () => element.removeEventListener(eventType, listener)
    };
  }

  dispose() {
    this._emitter.dispose();
    this._disposable.dispose();
  }
}
//*/

///*
export interface DOMEventMap extends HTMLElementEventMap, DocumentEventMap, WindowEventMap {}

export class DomEmitter<T> implements IDisposable {
  private _event: BaseEvent<T>;

  // 외부에서 구독할 수 있도록 event getter 노출
  get event(): BaseEvent<T> {
    return this._event;
  }

  // HTML 엘리먼트, 이벤트 이름, 옵션(capture 등)을 생성자로 받음
  constructor(
    element: Window | Document | HTMLElement,
    type: string,
    useCapture?: boolean
  ) {
    // Emitter의 event와 동일한 시그니처를 가진 함수를 정의
    this._event = (listener: (e: T) => any): IDisposable => {
      // 1. 실제 DOM 이벤트 리스너 등록
      element.addEventListener(type, listener as EventListener, useCapture);

      // 2. 반환되는 IDisposable의 dispose가 호출되면 이벤트를 해제함
      return {
        dispose: () => {
          element.removeEventListener(type, listener as EventListener, useCapture);
        }
      };
    };
  }

  // DomEmitter 자체는 상태를 가지지 않으므로 내보낼 자원이 없습니다.
  // (인터페이스 규격을 맞추기 위한 빈 메서드)
  dispose(): void {}
}
//*/