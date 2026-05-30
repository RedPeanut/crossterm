import { contextViewServiceId, setService } from "../Service";
import { $ } from '../util/dom';
import * as dom from '../util/dom';

export interface ContextViewDelegate {
  getAnchor(): HTMLElement;
  render(container: HTMLElement): void;
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
    const elementPosition = dom.getDomNodePagePosition(anchor);
  }

  hide(): void {
    const delegate = this.delegate;
		this.delegate = null;

    if(delegate.onHide) {
			delegate.onHide();
		}
    dom.hide(this.contextView);
  }
}