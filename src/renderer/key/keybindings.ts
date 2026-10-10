import { appShortcutsCmdId,
  editCopyCmdId, editPasteCmdId,
  tabAlignVerticalCmdId, tabAlignHorizontalCmdId, tabAlignTilesCmdId,
  tabToggleBroadcastInputCmdId,
} from '../../common/Types';
import { KeybindingWeight, keybindingsRegistry } from './KeybindingsRegistry';
import { getService, mainLayoutServiceId, broadcastInputServiceId, bodyLayoutServiceId, sessionPartServiceId } from '../Service';
import { MainLayoutService } from '../layout/MainLayout';
// import { keybindingsRegistry } from '../globals';
import { getFocusedTerm } from '../part/term/Term';
import { BroadcastInputService } from '../service/BroadcastInputService';
import { Group, SplitItem } from '../Types';
import { wrapper } from '../globals';
import { collectAllItems, getTileRows } from '../utils';
import { BodyLayoutService } from '../layout/BodyLayout';
import { SessionPartService } from '../part/SessionPart';

/**
 * 탭 정렬(Align) contribution.
 *
 * 탭으로 묶여 있던 것까지 포함해 모든 터미널을 펼친다. 터미널 하나가 그룹 하나가 된다.
 *   vertical  : 위→아래로 쌓기 (DropOverlay의 UP/DOWN 분할과 같은 mode)
 *   horizontal: 왼→오른쪽으로 늘어놓기
 *   tiles     : 행(vertical) 안에 열(horizontal)을 넣은 격자. 행별 개수는 getTileRows가 정한다.
 */

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: tabAlignVerticalCmdId,
  weight: KeybindingWeight.Core,
  handler: () => alignTabs((groups) => ({ mode: 'vertical', list: groups })),
});

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: tabAlignHorizontalCmdId,
  weight: KeybindingWeight.Core,
  handler: () => alignTabs((groups) => ({ mode: 'horizontal', list: groups })),
});

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: tabAlignTilesCmdId,
  weight: KeybindingWeight.Core,
  handler: () => alignTabs(buildTiles),
});

/**
 * ex. 3 -> { mode: 'vertical', list: [ [a], { mode: 'horizontal', list: [[b], [c]] } ] }
 *
 * 그룹이 하나뿐인 행은 SplitItem으로 감싸지 않고 그룹을 그대로 넣는다.
 * (list가 1개인 SplitItem은 cleanSingleSplitItemOnce가 걷어내는 형태다)
 */
function buildTiles(groups: Group[]): SplitItem {
  const rows = getTileRows(groups.length);
  if (rows.length === 1) return { mode: 'horizontal', list: groups };

  let offset = 0;
  const list = rows.map((count): SplitItem | Group => {
    const row = groups.slice(offset, offset += count);
    return row.length === 1 ? row[0] : { mode: 'horizontal', list: row };
  });
  return { mode: 'vertical', list };
}

function alignTabs(build: (groups: Group[]) => SplitItem): void {
  const items = collectAllItems(wrapper.tree);
  if (items.length === 0) return;

  // 그룹마다 터미널이 하나뿐이므로 모두 selected여야 화면에 보인다. active는 그대로 둔다.
  const groups: Group[] = items.map((item) => {
    item.selected = true;
    return [item];
  });
  wrapper.tree = build(groups);

  // 이후 처리는 DropOverlay.onDrop과 동일하다: 트리로 SessionPart를 다시 만들고 터미널 크기를 맞춘다.
  const bodyLayoutService: BodyLayoutService = getService(bodyLayoutServiceId);
  const sessionPartService: SessionPartService = getService(sessionPartServiceId);
  bodyLayoutService.recreate();
  bodyLayoutService.layout(0, 0); // not use param
  requestAnimationFrame(() => requestAnimationFrame(() => sessionPartService.fit()));
}

/**
 * 입력 브로드캐스트 contribution.
 *
 * `mod`는 mac에서 ⌘, 그 외에서 Ctrl로 갈리므로 플랫폼 분기가 필요 없다.
 *   mac : ⌘⌥I
 *   win : Ctrl+Alt+I
 *
 * Note. mac 개발 모드에서는 electron-debug가 ⌘⌥I를 DevTools로 먼저 잡는다.
 *       main.ts에서 그 등록을 풀어주고 있다(DevTools는 F12로 계속 열린다).
 */

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: tabToggleBroadcastInputCmdId,
  weight: KeybindingWeight.Core,
  primary: 'mod+alt+i',
  handler: () => {
    const broadcastInputService: BroadcastInputService = getService(broadcastInputServiceId);
    broadcastInputService.toggleVisible();
  },
});

/**
 * "Keyboard Shortcuts" 기능의 contribution.
 *
 * 커맨드 등록은 MainLayout(부트스트랩)이 아니라 기능이 사는 이 파일에서 한다.
 * MainLayout은 서비스를 만들고 이 파일을 import 하기만 하면 된다.
 * (VSCode도 workbench 부트스트랩이 contrib 파일들을 import 하는 구조)
 */

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: appShortcutsCmdId,
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
  id: editCopyCmdId,
  weight: KeybindingWeight.Core,
  primary: 'mod+c',
  // 터미널 밖이거나, 터미널 안이어도 선택 영역이 있을 때만 이 키를 가져간다.
  // 터미널에 포커스가 있는데 선택이 없으면 매칭되지 않으므로 xterm으로 그대로 흘러가 SIGINT가 된다.
  when: '!terminalFocused || terminalHasSelection',
  handler: () => copy(),
});

keybindingsRegistry.registerCommandAndKeybindingRule({
  id: editPasteCmdId,
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