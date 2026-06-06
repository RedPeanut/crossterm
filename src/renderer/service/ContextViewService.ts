import { contextViewServiceId, setService } from "../Service";
import { $ } from '../util/dom';
import * as dom from '../util/dom';

export const enum AnchorAlignment {
  LEFT, RIGHT
}

export const enum AnchorPosition {
  BELOW, ABOVE
}

export interface Position {
  top: number;
  left: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface View extends Position, Size { }

export interface ContextViewDelegate {
  getAnchor(): HTMLElement;
  render(container: HTMLElement): void;
  anchorAlignment?: AnchorAlignment; // default: left
  anchorPosition?: AnchorPosition; // default: below
  onHide(): void;
}

export interface ContextViewService {
  show(delegate: ContextViewDelegate): void;
  hide(): void;
}

export class ContextViewServiceImpl implements ContextViewService {
  container: HTMLElement;
  contextView: HTMLElement;
  delegate: ContextViewDelegate;

  constructor(container: HTMLElement) {
    this.container = container;
    setService(contextViewServiceId, this);
    const contextView = this.contextView = $('.context-view');
    this.container.appendChild(contextView);
  }

  show(delegate: ContextViewDelegate): void {
    this.delegate = delegate;

    dom.clearNode(this.contextView);
    // this.contextView.className = 'component';
    this.contextView.style.top = '0px';
    this.contextView.style.left = '0px';
    // this.contextView.style.zIndex = `${2575}`; // + (delegate.layer ?? 0)}`;
    this.contextView.style.position = 'absolute';
    dom.show(this.contextView);
    delegate.render(this.contextView);

    this.doLayout();
  }

  doLayout(): void {
    const anchor = this.delegate.getAnchor();

    console.log('anchor =', dom.getDomNodePagePosition(anchor));
    console.log('this.contextView =', dom.getDomNodePagePosition(this.contextView));

    let around: View;
    const elementPosition = dom.getDomNodePagePosition(anchor);

    around = {
      top: elementPosition.top,
      left: elementPosition.left,
      width: elementPosition.width,
      height: elementPosition.height
    };

    const viewSizeWidth = dom.getTotalWidth(this.contextView);
    const viewSizeHeight = dom.getTotalHeight(this.contextView);

    console.log('viewSizeWidth =', viewSizeWidth);
    console.log('viewSizeHeight =', viewSizeHeight);

    const anchorPosition = this.delegate.anchorPosition || AnchorPosition.BELOW;
    const anchorAlignment = this.delegate.anchorAlignment || AnchorAlignment.LEFT;

    let top: number;
    let left: number;

    const activeWindow = window; // dom.getActiveWindow();

    top = around.top + around.height;
    left = around.left;

    this.contextView.classList.remove('top', 'bottom', 'left', 'right');
    this.contextView.classList.add(anchorPosition === AnchorPosition.BELOW ? 'bottom' : 'top');
    this.contextView.classList.add(anchorAlignment === AnchorAlignment.LEFT ? 'left' : 'right');

    // this.contextView.style.top = `${top - dom.getDomNodePagePosition(this.contextView).top}px`;
		// this.contextView.style.left = `${left - dom.getDomNodePagePosition(this.contextView).left}px`;
    this.contextView.style.top = `${top}px`;
    this.contextView.style.left = `${left}px`;
    this.contextView.style.width = 'initial';
  }

  hide(): void {
    const delegate = this.delegate;
    this.delegate = null;

    if(delegate?.onHide) {
      delegate.onHide();
    }
    dom.hide(this.contextView);
  }
}