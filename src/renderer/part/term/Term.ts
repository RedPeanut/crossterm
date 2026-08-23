import { $ } from "../../util/dom";
import { ConnStatus, TerminalItem } from "../../../common/Types";
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

  onConnected: ((...args: unknown[]) => void) | null = null;
  onError: ((...args: unknown[]) => void) | null = null;
  onClosed: ((...args: unknown[]) => void) | null = null;

  constructor(parent: HTMLElement, item: TerminalItem) {
    this.parent = parent;
    this.item = item;
    this.uid = uuidv4();
    this.fitAddon = new FitAddon();
  }

  create(): HTMLElement {
    const el = this.element = $('.term');
    const item = this.item;
    if (item.selected) el.classList.add('selected');
    if (item.active) el.classList.add('active');
    el.id = this.uid;
    return el;
  }

  createTerminal(): void {

    if (terminals[this.uid]) return;

    let retVal = window.ipc.send('terminal new', {
      ...this.item,
      uid: this.uid,
      // type: 'local',
      // size: { col: 80, row: 24 },
      // url: { protocol: '', user: '', resource: '', port: '' }
    });
    // console.log('retVal =', retVal);

    const _xterm = new xterm({
      fontSize: 13
    });
    // Load WebLinksAddon on terminal, this is all that's needed to get web links
    // working in the terminal.
    _xterm.loadAddon(new WebLinksAddon());
    _xterm.loadAddon(this.fitAddon);
    _xterm.open(document.getElementById(this.uid) as HTMLElement);
    _xterm.onKey((e) => this.onKey(e));
    _xterm.onData((e) => this.onData(e));
    _xterm.onResize(({cols, rows}) => {
      window.ipc.send('terminal resize', { uid: this.uid, cols, rows });
    });
    this.fitAddon.fit();
    this.xterm = _xterm;

    terminals[this.uid] = this;

    // register SSH lifecycle listeners (remote only)
    if (this.item.type === 'remote') {
      this.onConnected = (...args: unknown[]) => {
        const uid = args[1] as string;
        if (uid !== this.uid) return;
        this.setConnStatus('connected');
      };

      this.onError = (...args: unknown[]) => {
        const { uid, message } = args[1] as { uid: string; message: string };
        if (uid !== this.uid) return;
        this.setConnStatus('error');
        // toast.show(`SSH 연결 오류: ${message}`, 'error', 5000);
      };

      this.onClosed = (...args: unknown[]) => {
        const uid = args[1] as string;
        if (uid !== this.uid) return;
        this.setConnStatus('closed');
        this.xterm.write('\r\n\x1b[33m[연결이 종료되었습니다]\x1b[0m\r\n');
      };

      // window.ipc.on('terminal connected', this.onConnected);
      window.ipc.on('terminal error', this.onError);
      window.ipc.on('terminal closed', this.onClosed);
    }
  }

  onKey(e: { key: string; domEvent: KeyboardEvent }) {
    const printable: boolean = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
  }

  onData(data: string) {
    // console.log('onData() is called..., e =', data);
    window.ipc.send('terminal write', {
      uid: this.uid,
      data: data
    });
  }

  fit() { this.fitAddon.fit(); }

  setConnStatus(status: ConnStatus): void {
    this.item.connStatus = status;
    // this.item.onConnStatusChange?.(status);
  }

  destroy(): void {
    // if (this.onConnected) window.ipc.off('terminal connected', this.onConnected);
    if (this.onError) window.ipc.off('terminal error', this.onError);
    if (this.onClosed) window.ipc.off('terminal closed', this.onClosed);
    this.xterm.dispose();
    delete terminals[this.uid];
  }
}