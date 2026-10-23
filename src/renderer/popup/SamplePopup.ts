import { Popup } from "../Popup";
import { $ } from "../util/dom";
import * as dom from "../util/dom";

export interface SamplePopupOptions {}

export class SamplePopup extends Popup {
  constructor(parent: HTMLElement, options: SamplePopupOptions = {}) {
    super(parent, { classList: ['sample'], ...options });
  }

  override renderTitleArea(): void {
    super.renderTitleArea();
    this.title.innerHTML = 'Sample Popup';
  }

  override renderContentArea(): void {
    super.renderContentArea();

    this.contentArea.classList.add('sample');
    const p = $('p');
    p.innerHTML = `blarblarblar blarblarblar blarblarblar ...<br/>
blarblarblar blarblarblar blarblarblar ...<br/>
blarblarblar blarblarblar blarblarblar ...<br/>
blarblarblar blarblarblar blarblarblar ...
`;
    this.contentArea.append(p);
  }
}