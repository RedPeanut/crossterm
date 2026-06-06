import { Channels, ElectronHandler } from "../main/preload";
import { EventEmitter } from "events";

/* // type Who;
type Where = HTMLElement | ElectronHandler;
// type What;
// type Handler = (() => void) | ((...args: any[]) => void);

export class Disposable extends EventEmitter {

  // map: Map<string, (e: Event) => void> = new Map();
  map: Map<Where, Map<string, ((e: Event) => void)[]>> = new Map();

  dispose(): void {
    for(const [where, what] of this.map) {
      for(const [event, handlers] of this.map.get(where)) {
        for(const handler of handlers) {
          if(where instanceof HTMLElement)
            where.removeEventListener(event, handler);
          // else if(where instanceof ElectronHandler) // 'ElectronHandler' only refers to a type, but is being used as a value here.ts(2693)
          // else if(typeof where === typeof window.ipc)
          else if(where === window.ipc)
            where.off(event as Channels, handler);
        }
      }
      this.map.get(where).clear();
    }

    for(const [event, handlers] of this.on_map) {
      for(const handler of handlers) {
        this.off(event, handler);
      }
    }
    this.on_map.clear(); // = null;
  }

  register(where: Where, event: string, handler: (e: Event) => void) {
    if(where instanceof HTMLElement)
      where.addEventListener(event, handler);
    else if(where === window.ipc) {
      where.on(event as Channels, handler);
    } else {
      // must do not enter here
      throw new Error();
    }

    if(this.map.get(where)) {
      if(this.map.get(where).get(event)) {
        this.map.get(where).get(event).push(handler);
      } else {
        this.map.get(where).set(event, [ handler ]);
      }
    } else {
      const what = new Map<string, any>();
      what.set(event, [ handler ]);
      this.map.set(where, what);
    }
  }

  on_map: Map<string, ((e: Event) => void)[]> = new Map();

  // _on(event: string, handler: (e: Event) => void) {
  _on(event: string, handler: (...args: any[]) => void) {
    if(this.on_map.get(event)) {
      this.on_map.get(event).push(handler);
      this.on(event, handler);
    } else {
      this.on_map.set(event, [ handler ]);
      this.on(event, handler);
    }
  }
} */

export interface IDisposable {
  dispose(): void;
}

export class DisposableStore implements IDisposable {
  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  public add<T extends IDisposable>(o: T): T {
    if (this._isDisposed) {
      o.dispose();
      return o;
    }
    this._toDispose.add(o);
    return o;
  }

  public dispose(): void {
    if (this._isDisposed) return;
    this._isDisposed = true;

    for (const item of this._toDispose) {
      item.dispose();
    }
    this._toDispose.clear();
  }
}

export class Disposable extends EventEmitter implements IDisposable {
  readonly _store = new DisposableStore();

  _register<T extends IDisposable>(o: T): T {
    return this._store.add(o);
  }

  _on(event: string, handler: (...args: any[]) => void) {
    return {
      dispose: () => this.off(event, handler)
    }
  }

  dispose(): void {
    this._store.dispose();
  }
}

export function _addEventListener(element: HTMLElement, event: string, handler: EventListener): IDisposable {
  element.addEventListener(event, handler);

  return {
    dispose: () => element.removeEventListener(event, handler)
  };
}

/* export function _addListener(element: Broadcast, event: string, handler: EventListener): IDisposable {
  element.addListener(event, handler);

  return {
    dispose: () => element.removeListener(event, handler)
  };
} */

export function _on(element: ElectronHandler, event: string, handler: (...args: any[]) => void) {
  element.on(event as Channels, handler);

  return {
    dispose: () => element.off(event as Channels, handler)
  }
}
