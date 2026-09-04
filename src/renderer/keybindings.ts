import { appShortcutsCommandId,
  editCopyCommandId, editPasteCommandId
} from '../common/Types';
import { KeybindingWeight } from './key/KeybindingsRegistry';
import { getService, mainLayoutServiceId } from './Service';
import { MainLayoutService } from './layout/MainLayout';
import { keybindingsRegistry } from './globals';
import { getFocusedTerm } from './part/term/Term';

/**
 * "Keyboard Shortcuts" 기능의 contribution.
 *
 * 커맨드 등록은 MainLayout(부트스트랩)이 아니라 기능이 사는 이 파일에서 한다.
 * MainLayout은 서비스를 만들고 이 파일을 import 하기만 하면 된다.
 * (VSCode도 workbench 부트스트랩이 contrib 파일들을 import 하는 구조)
 */

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: appShortcutsCommandId,
  weight: KeybindingWeight.Core,
  primary: 'mod+k mod+s', // mac: ⌘K ⌘S / win, linux: Ctrl+K Ctrl+S
  // TODO: 단축키 편집 화면이 생기면 그걸 열도록 교체
  handler: () => {
    (getService(mainLayoutServiceId) as MainLayoutService).showDialog();
  },
});

/**
 * 복사/붙여넣기 contribution.
 *
 * 터미널과 일반 입력 필드를 한 커맨드가 모두 처리한다.
 * `when` 절의 역할은 "이 키를 가져갈 것인가(=preventDefault)"를 정하는 것이고,
 * 실제로 무엇을 복사할지는 핸들러가 판단한다.
 */

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: editCopyCommandId,
  weight: KeybindingWeight.Core,
  primary: 'mod+c',
  // 터미널 밖이거나, 터미널 안이어도 선택 영역이 있을 때만 이 키를 가져간다.
  // 터미널에 포커스가 있는데 선택이 없으면 매칭되지 않으므로 xterm으로 그대로 흘러가 SIGINT가 된다.
  when: '!terminalFocused || terminalHasSelection',
  handler: () => copy(),
});

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: editPasteCommandId,
  weight: KeybindingWeight.Core,
  primary: 'mod+v',
  handler: () => paste(),
});

function copy(): void {
  const text = getFocusedTerm()?.xterm?.getSelection() || getDomSelection();
  if (text) window.ipc.send('clipboard write text', text);
}

/**
 * 현재 선택된 텍스트.
 *
 * Note. document.execCommand('copy')를 쓰지 않는다. 네이티브 메뉴 클릭은 IPC를 거쳐 들어오므로
 *       renderer 입장에서는 user gesture가 아니고, 그러면 execCommand가 무시될 수 있다.
 */
function getDomSelection(): string {
  const el = document.activeElement;
  // input/textarea의 선택은 window.getSelection()으로 잡히지 않는다.
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    return el.value.substring(el.selectionStart ?? 0, el.selectionEnd ?? 0);
  }
  return window.getSelection()?.toString() ?? '';
}

async function paste(): Promise<void> {
  const text = await window.ipc.invoke('clipboard read text') as string;
  if (!text) return;

  const term = getFocusedTerm();
  if (term?.xterm) {
    // xterm이 bracketed paste mode까지 처리해서 onData로 흘려준다.
    term.xterm.paste(text);
    return;
  }
  // 입력 필드에는 insertText로 넣어야 undo 스택이 유지된다.
  document.execCommand('insertText', false, text);
}