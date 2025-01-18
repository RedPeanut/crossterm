import { $ } from "../../util/dom";
import { TerminalItem } from "../../../common/Types";
import { v4 as uuidv4 } from 'uuid';
import 'xterm/css/xterm.css';
import { Terminal as xterm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { terminals } from '../../../globals';

export class Term {
  parent: HTMLElement;
  item: TerminalItem;
  element: HTMLElement;

  uid: string;
  xterm: xterm | null = null;
  fitAddon: FitAddon;

  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
    this.uid = uuidv4();
    this.fitAddon = new FitAddon();
  }

  create(): HTMLElement {
    const term = this.element = $('.term');
    term.id = this.uid;
    return term;
  }

  createTerminal(): void {
    let retVal = window.ipc.send('new', {
      // ...item,
      uid: this.uid,
      type: 'local',
      size: { col: 80, row: 24 },
      url: { protocol: '', user: '', resource: '', port: '' }
    });
    // console.log('retVal =', retVal);

    const _xterm = new xterm({});
    // Load WebLinksAddon on terminal, this is all that's needed to get web links
    // working in the terminal.
    _xterm.loadAddon(new WebLinksAddon());
    _xterm.loadAddon(this.fitAddon);
    _xterm.open(document.getElementById(this.uid) as HTMLElement);
    _xterm.onKey((e) => this.onKey(e));
    _xterm.onData((e) => this.onData(e));
    this.fitAddon.fit();
    this.xterm = _xterm;

    terminals[this.uid] = this;
  }

  onKey(e: { key: string; domEvent: KeyboardEvent }) {
    const printable: boolean = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
  }

  onData(data: string) {
    // console.log('onData() is called..., e =', data);
    window.ipc.send('data', {
      uid: this.uid,
      data: data
    });
  }
}