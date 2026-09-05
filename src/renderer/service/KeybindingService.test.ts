import assert from 'assert';
// import { CommandService } from '../../common/key/Commands';
import { IDisposable } from '../../common/base/lifecycle';
// import { keybindingsRegistry, KeybindingWeight } from '../../common/key/KeybindingsRegistry';
// import { terminalFocusedContextKeyName, terminalHasSelectionContextKeyName } from '../part/term/TerminalContextKeys';
import { ContextKeyService } from './ContextKeyService';
import { KeybindingService } from './KeybindingService';
// import { keybindingsRegistry } from '../globals';
import { KeybindingWeight, keybindingsRegistry } from '../key/KeybindingsRegistry';
import { terminalFocusedContextKeyName, terminalHasSelectionContextKeyName } from '../key/contextKeys';
import { CommandService } from './CommandService';

describe('#KeybindingService', function () {

  const modifier = process.platform === 'darwin' ? { metaKey: true } : { ctrlKey: true };

  let attached: IDisposable;
  let term: HTMLElement;

  afterEach(function () {
    attached?.dispose();
    term?.remove();
  });

  /** Term.create()가 만드는 구조를 흉내낸다: .term 엘리먼트에 scope, 그 안에 xterm의 textarea */
  function setup(rule: { id: string; primary: string; when?: string }) {
    const contextKeyService = new ContextKeyService();
    const keybindingService = new KeybindingService(contextKeyService, new CommandService());
    attached = keybindingService.attach(window);

    const invoked: string[] = [];
    keybindingsRegistry.registerCommandAndKeybindingRule({
      ...rule,
      weight: KeybindingWeight.Core,
      handler: () => { invoked.push(rule.id); },
    });

    term = document.createElement('div');
    const textarea = document.createElement('textarea');
    term.appendChild(textarea);
    document.body.appendChild(term);

    const scoped = contextKeyService.createScoped(term);

    /** @returns 커맨드가 실행됐는지, 그리고 키가 소비됐는지(=xterm까지 가지 않는지) */
    const press = async (target: EventTarget, code: string) => {
      const e = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...modifier });
      target.dispatchEvent(e);
      await Promise.resolve();
      return { ran: invoked.splice(0).length, consumed: e.defaultPrevented };
    };

    return { scoped, textarea, press };
  }

  it('terminalFocused로 터미널 안/밖 동작이 갈린다', async function () {
    const { scoped, textarea, press } = setup({ id: 'test.outsideOnly', primary: 'mod+c', when: '!terminalFocused' });
    const terminalFocused = scoped.createKey<boolean>(terminalFocusedContextKeyName, false);

    assert.deepStrictEqual(
      [
        await press(document.body, 'KeyC'),  // 터미널 밖
        await press(textarea, 'KeyC'),       // 터미널 안이지만 포커스 없음
        (terminalFocused.set(true), await press(textarea, 'KeyC')),   // 터미널 포커스
        (terminalFocused.set(false), await press(textarea, 'KeyC')),  // 포커스 잃음
      ],
      [
        { ran: 1, consumed: true },
        { ran: 1, consumed: true },
        { ran: 0, consumed: false },
        { ran: 1, consumed: true },
      ]
    );
  });

  it('선택 영역이 없는 터미널에서는 복사 키를 가져가지 않는다 (SIGINT 통과)', async function () {
    // Clipboard contrib이 쓰는 것과 같은 when 절
    const { scoped, textarea, press } = setup({
      id: 'test.copyRule',
      primary: 'mod+c',
      when: '!terminalFocused || terminalHasSelection',
    });
    const terminalFocused = scoped.createKey<boolean>(terminalFocusedContextKeyName, false);
    const hasSelection = scoped.createKey<boolean>(terminalHasSelectionContextKeyName, false);
    terminalFocused.set(true);

    assert.deepStrictEqual(
      [
        await press(textarea, 'KeyC'),                            // 선택 없음 -> 터미널로 흘려보냄
        (hasSelection.set(true), await press(textarea, 'KeyC')),   // 선택 있음 -> 복사가 가져감
      ],
      [
        { ran: 0, consumed: false },
        { ran: 1, consumed: true },
      ]
    );
  });

  it('붙여넣기는 터미널 안에서도 항상 키를 가져간다', async function () {
    const { scoped, textarea, press } = setup({ id: 'test.pasteRule', primary: 'mod+v' });
    scoped.createKey<boolean>(terminalFocusedContextKeyName, true);

    assert.deepStrictEqual(await press(textarea, 'KeyV'), { ran: 1, consumed: true });
  });

});
