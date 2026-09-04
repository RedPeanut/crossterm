import { $ } from "../../util/dom";
import { ConnStatus, TerminalItem } from "../../../common/Types";
import { v4 as uuidv4 } from 'uuid';
import 'xterm/css/xterm.css';
import { Terminal as xterm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { terminals } from '../../globals';
// import { ContextKey } from '../../../common/key/ContextKey';
import { ContextKeyService } from '../../service/ContextKeyService';
import { contextKeyServiceId, getService } from '../../Service';
import { ContextKey } from "../../key/ContextKey";
import { terminalFocusedContextKeyName, terminalHasSelectionContextKeyName } from "../../contextKeys";
// import { terminalFocusedContextKeyName, terminalHasSelectionContextKeyName } from './TerminalContextKeys';

/**
 * 지금 포커스를 갖고 있는 터미널. 없으면 undefined.
 * document.activeElement에서 가장 가까운 `.term`을 찾아 uid로 역조회한다.
 */
export function getFocusedTerm(): Term | undefined {
  const el = (document.activeElement as HTMLElement | null)?.closest('.term') as HTMLElement | null;
  return el ? terminals[el.id] : undefined;
}

export class Term {
  parent: HTMLElement;
  item: TerminalItem;
  element: HTMLElement;

  uid: string;
  xterm: xterm | null = null;
  fitAddon: FitAddon;

  /** 이 터미널 하위에서만 유효한 context. */
  scopedContextKeyService: ContextKeyService;
  terminalFocused: ContextKey<boolean>;
  terminalHasSelection: ContextKey<boolean>;

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

    // 이 터미널 하위에서만 보이는 context를 만들고, 포커스 상태를 노출한다.
    // keydown은 xterm의 textarea에서 올라오는데 그게 이 element 안에 있으므로,
    // KeybindingService가 DOM을 거슬러 올라가며 이 context를 찾게 된다.
    const contextKeyService: ContextKeyService = getService(contextKeyServiceId);
    this.scopedContextKeyService = contextKeyService.createScoped(el);
    this.terminalFocused = this.scopedContextKeyService.createKey<boolean>(terminalFocusedContextKeyName, false);
    this.terminalHasSelection = this.scopedContextKeyService.createKey<boolean>(terminalHasSelectionContextKeyName, false);

    // xterm 5.x에는 onFocus/onBlur 이벤트가 없어서 DOM 이벤트로 잡는다.
    // (focus/blur와 달리 focusin/focusout은 버블링되므로 textarea의 포커스도 여기서 받는다)
    el.addEventListener('focusin', () => this.terminalFocused.set(true));
    el.addEventListener('focusout', (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && el.contains(next)) return; // 터미널 내부에서의 포커스 이동은 무시
      this.terminalFocused.set(false);
    });

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
    // 선택 영역 유무를 context로 노출한다. 복사 커맨드가 이 키로 "키를 가져갈지"를 판단한다.
    _xterm.onSelectionChange(() => this.terminalHasSelection.set(_xterm.hasSelection()));
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
    this.scopedContextKeyService.dispose();
    delete terminals[this.uid];
  }
}