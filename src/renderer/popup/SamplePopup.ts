import { Popup } from "../Popup";
import { $ } from "../util/dom";
import * as dom from "../util/dom";

export interface SamplePopupOptions {}

export class SamplePopup extends Popup {
  constructor(parent: HTMLElement, options: SamplePopupOptions = {}) {
    super(parent, { classList: ['sample'], ...options });

    // custom title in here
    this.title.innerHTML = 'Sample Popup';

    // custom contentArea in here
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