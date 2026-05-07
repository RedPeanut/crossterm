import { Channels, ElectronHandler } from "../main/preload";

// type Who;
type Where = HTMLElement | ElectronHandler;
// type What;
// type Handler = (() => void) | ((...args: any[]) => void);

export class Disposable {

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

}