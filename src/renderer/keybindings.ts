import { appShortcutsCommandId } from '../common/Types';
import { KeybindingWeight } from './key/KeybindingsRegistry';
import { getService, mainLayoutServiceId } from './Service';
import { MainLayoutService } from './layout/MainLayout';
import { keybindingsRegistry } from './globals';

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