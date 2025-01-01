//# region Multi-Window Support Utilities

import { mainWindow, CodeWindow } from "..";

export const {
  getWindow,
  getDocument,
} = (function () {
  return {
    getWindow(e: Node | UIEvent | undefined | null): CodeWindow {
      const candidateNode = e as Node | undefined | null;
      if(candidateNode?.ownerDocument?.defaultView) {
        return candidateNode.ownerDocument.defaultView.window as CodeWindow;
      }

      const candidateEvent = e as UIEvent | undefined | null;
      if(candidateEvent?.view) {
        return candidateEvent.view.window as CodeWindow;
      }

      return mainWindow;
    },
    getDocument(e: Node | UIEvent | undefined | null): Document {
      const candidateNode = e as Node | undefined | null;
      return getWindow(candidateNode).document;
    }
  };
})();

export function append<T extends Node>(parent: HTMLElement, child: T): T;
export function append<T extends Node>(parent: HTMLElement, ...children: (T | string)[]): T | void {
  parent.append(...children);
  if(children.length === 1 && typeof children[0] !== 'string') {
    return <T>children[0];
  }
}

export function prepend<T extends Node>(parent: HTMLElement, child: T): T {
  parent.insertBefore(child, parent.firstChild);
  return child;
}

const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;

export enum Namespace {
  HTML = 'http://www.w3.org/1999/xhtml',
  SVG = 'http://www.w3.org/2000/svg'
}

function _$<T extends Element>(namespace: Namespace, description: string, attrs?: { [key: string]: any }, ...children: Array<Node | string>): T {
  const match = SELECTOR_REGEX.exec(description);

  if(!match) {
    throw new Error('Bad use of emmet');
  }

  const tagName = match[1] || 'div';
  let result: T;
  result = document.createElement(tagName) as unknown as T;
  if(match[3]) {
    result.id = match[3];
  }
  if(match[4]) {
    result.className = match[4].replace(/\./g, ' ').trim();
  }
  if(attrs) {
    Object.entries(attrs).forEach(([name, value]) => {
    });
  }
  result.append(...children);
  return result;
}

export function $<T extends HTMLElement>(description: string, attrs?: { [key: string]: any }, ...children: Array<Node | string>): T {
  return _$(Namespace.HTML, description, attrs, ...children);
}


export class Dimension {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width; this.height = height;
  }
}

export function getClientArea(element: HTMLElement): Dimension {
  const elWindow = getWindow(element);
  const elDocument = elWindow.document;

  // Try with DOM clientWidth / clientHeight
  if(element !== elDocument.body) {
    return new Dimension(element.clientWidth, element.clientHeight);
  }

  /* // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight
  if(platform.isIOS && elWindow?.visualViewport) {
    return new Dimension(elWindow.visualViewport.width, elWindow.visualViewport.height);
  } */

  // Try innerWidth / innerHeight
  if(elWindow?.innerWidth && elWindow.innerHeight) {
    return new Dimension(elWindow.innerWidth, elWindow.innerHeight);
  }

  // Try with document.body.clientWidth / document.body.clientHeight
  if(elDocument.body && elDocument.body.clientWidth && elDocument.body.clientHeight) {
    return new Dimension(elDocument.body.clientWidth, elDocument.body.clientHeight);
  }

  // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
  if(elDocument.documentElement && elDocument.documentElement.clientWidth && elDocument.documentElement.clientHeight) {
    return new Dimension(elDocument.documentElement.clientWidth, elDocument.documentElement.clientHeight);
  }

  throw new Error('Unable to figure out browser width and height');
}

export function size(element: HTMLElement, width: number | null, height: number | null): void {
  if(typeof width === 'number') {
    element.style.width = `${width}px`;
  }

  if(typeof height === 'number') {
    element.style.height = `${height}px`;
  }
}

export function position(element: HTMLElement, top: number, right?: number, bottom?: number, left?: number, position: string = 'absolute'): void {
  if(typeof top === 'number') {
    element.style.top = `${top}px`;
  }

  if(typeof right === 'number') {
    element.style.right = `${right}px`;
  }

  if(typeof bottom === 'number') {
    element.style.bottom = `${bottom}px`;
  }

  if(typeof left === 'number') {
    element.style.left = `${left}px`;
  }

  element.style.position = position;
}
export function domContentLoaded(targetWindow: Window): Promise<void> {
  return new Promise<void>(resolve => {
    const readyState = targetWindow.document.readyState;
    if (readyState === 'complete' || (targetWindow.document && targetWindow.document.body !== null)) {
      resolve(undefined);
    } else {
      const listener = () => {
        targetWindow.window.removeEventListener('DOMContentLoaded', listener, false);
        resolve();
      };
      targetWindow.window.addEventListener('DOMContentLoaded', listener, false);
    }
  });
}

export function show(...elements: HTMLElement[]): void {
  for(const element of elements) {
    element.style.display = '';
    element.removeAttribute('aria-hidden');
  }
}

export function hide(...elements: HTMLElement[]): void {
  for(const element of elements) {
    element.style.display = 'none';
    element.setAttribute('aria-hidden', 'true');
  }
}