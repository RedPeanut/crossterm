import { IDisposable } from "./lifecycle";

/**
 * Impl Event n EventEmitter
 * feat by gemini: https://gemini.google.com/share/f4ebb102218e
 */

export interface Event<T> {
  (listener: (e: T) => any): IDisposable;
}

export class Emitter<T> {
  private _listeners: Array<(e: T) => any> = [];
  private _event?: Event<T>;

  // 외부에 노출할 Event 객체 (getter)
  get event(): Event<T> {
    if(!this._event) {
      this._event = (listener: (e: T) => any): IDisposable => {
        this._listeners.push(listener);

        // 구독 해제(Disposable)를 반환
        return {
          dispose: () => {
            this._listeners = this._listeners.filter(l => l !== listener);
          }
        };
      };
    }
    return this._event;
  }

  // 이벤트를 발생시키는 메서드 (내부나 상속된 클래스에서만 호출)
  fire(data: T): void {
    // 루프 중 배열이 변형되는 것을 방지하기 위해 복사본으로 순회
    const queue = [...this._listeners];
    for(const listener of queue) {
      listener(data);
    }
  }

  // emitter 자체를 폐기할 때 리스너 전체 정리
  dispose(): void {
    this._listeners = [];
  }
}