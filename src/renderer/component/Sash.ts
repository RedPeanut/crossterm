import _ from "lodash";
import { $, append } from "../util/dom";
import Runtime from "../util/Runtime";
import { isMacintosh } from "../util/platform";
import { EventEmitter } from "events";

export const enum Orientation {
  VERTICAL,
  HORIZONTAL
}

export const enum SashState {
  Disabled,
  AtMinimum,
  AtMaximum,
  Enabled
}

/**
 * A vertical sash layout provider provides position and height for a sash.
 */
export interface VerticalSashLayoutProvider {
  getVerticalSashLeft(sash: Sash): number;
  getVerticalSashTop?(sash: Sash): number;
  getVerticalSashHeight?(sash: Sash): number;
}

/**
 * A vertical sash layout provider provides position and width for a sash.
 */
export interface HorizontalSashLayoutProvider {
  getHorizontalSashTop(sash: Sash): number;
  getHorizontalSashLeft?(sash: Sash): number;
  getHorizontalSashWidth?(sash: Sash): number;
}

type SashLayoutProvider = VerticalSashLayoutProvider | HorizontalSashLayoutProvider;

export interface SashEvent {
  readonly sash: Sash;
  readonly startX: number;
  readonly currentX: number;
  readonly startY: number;
  readonly currentY: number;
  readonly altKey: boolean;
}

export interface SashOptions {
  orientation: Orientation;
  size?: number;
}

export interface VerticalSashOptions extends SashOptions {
  orientation: Orientation.VERTICAL;
}

export interface HorizontalSashOptions extends SashOptions {
  orientation: Orientation.HORIZONTAL;
}

export class Sash extends EventEmitter {
  container: HTMLElement;
  el: HTMLElement;
  layoutProvider: SashLayoutProvider;
  orientation: Orientation;
  size: number = 4;
  hoverDelay: number = 300;

  _state: SashState = SashState.Enabled;
  get state(): SashState { return this._state; }
  set state(state: SashState) {
    if(this._state === state)
      return;

    this.el.classList.toggle('disabled', state === SashState.Disabled);
    this.el.classList.toggle('minimum', state === SashState.AtMinimum);
    this.el.classList.toggle('maximum', state === SashState.AtMaximum);

    this._state = state;
    // this.onDidEnablementChange.fire(state);
    this.emit('sash state change', state);
  }

  constructor(container: HTMLElement, verticalLayoutProvider: VerticalSashLayoutProvider, options: VerticalSashOptions);
  constructor(container: HTMLElement, horizontalLayoutProvider: HorizontalSashLayoutProvider, options: HorizontalSashOptions);
  constructor(container: HTMLElement, layoutProvider: SashLayoutProvider, options: SashOptions) {
    super();

    const self = this;
    this.container = container;
    this.el = append(container, $('.sash'));
    if(isMacintosh)
      this.el.classList.add('mac');

    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    // this.el.addEventListener('touchstart', this.onMouseDown.bind(this));
    this.el.addEventListener('dblclick', (e) => {});
    this.el.addEventListener('mouseenter', (e) => {
      _.throttle(() => this.el.classList.add('hover'), this.hoverDelay, {trailing:false})();
    });
    this.el.addEventListener('mouseleave', (e) => {
      this.el.classList.remove('hover');
    });

    let doubleTapTimeout: any = undefined;
    this.el.addEventListener('tab', (e) => {
      if(doubleTapTimeout) {
        clearTimeout(doubleTapTimeout);
        doubleTapTimeout = undefined;
        // this.onPointerDoublePress(event);
        return;
      }

      clearTimeout(doubleTapTimeout);
      doubleTapTimeout = setTimeout(() => doubleTapTimeout = undefined, 250);
    });

    this.layoutProvider = layoutProvider;
    this.orientation = options.orientation || Orientation.VERTICAL;

    if(this.orientation === Orientation.HORIZONTAL) {
      this.el.classList.add('horizontal');
      this.el.classList.remove('vertical');
    } else {
      this.el.classList.remove('horizontal');
      this.el.classList.add('vertical');
    }

    this.on('sash state change', (state: SashState) => {});
  }

  onMouseDown(e) {
    // e.preventDefault();
    const self = this;
    const startX = e.pageX;
    const startY = e.pageY;
    const altKey = e.altKey;

    this.el.classList.add('active');
    this.emit('sash start', { sash: this, startX, startY, altKey });

    const onMouseMove = (e) => {
      const event: SashEvent = {
        sash: this,
        startX: startX, currentX: e.pageX,
        startY: startY, currentY: e.pageY,
        altKey
      };
      this.emit('sash change', event);
    }

    const onMouseUp = (e) => {
      this.el.classList.remove('active');
      this.emit('sash end');

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  layout(): void {
    if(this.orientation === Orientation.VERTICAL) {
      const verticalProvider = (<VerticalSashLayoutProvider>this.layoutProvider);
      this.el.style.left = verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px';

      if(verticalProvider.getVerticalSashTop)
        this.el.style.top = verticalProvider.getVerticalSashTop(this) + 'px';

      if(verticalProvider.getVerticalSashHeight) {
        this.el.style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
      }
    } else {
      const horizontalProvider = (<HorizontalSashLayoutProvider>this.layoutProvider);
      this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px';

      if(horizontalProvider.getHorizontalSashLeft)
        this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';

      if(horizontalProvider.getHorizontalSashWidth)
        this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
    }
  }
}