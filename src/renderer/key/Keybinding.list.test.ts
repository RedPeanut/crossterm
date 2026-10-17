import assert from 'assert';
import { ContextKeyService } from '../service/ContextKeyService';
import { toElectronAccelerator } from './Keybinding';
import { KeybindingResolver, ResultKind } from './KeybindingResolver';
import { KeybindingWeight, toUserKeybindingItems } from './KeybindingsRegistry';

describe('#Keybinding.list', function () {

  it('list copy wins only below the focused list', function () {
    // getDefaultKeybindings 가 Core -> Contrib 순으로 정렬한 것과 같은 순서로 넣는다
    const resolver = new KeybindingResolver(toUserKeybindingItems([
      { id: 'edit.copy.cmd', weight: KeybindingWeight.Core, primary: 'ctrl+c', when: '!terminalFocused || terminalHasSelection' },
      { id: 'list.copy.cmd', weight: KeybindingWeight.Contrib, primary: 'ctrl+c', when: 'listFocus' },
    ]));

    const root = new ContextKeyService();
    const listEl = document.createElement('div');
    const input = document.createElement('input');
    listEl.appendChild(input);
    const listFocus = root.createScoped(listEl).createKey<boolean>('listFocus', false);

    const commandOf = (target: HTMLElement | null) => {
      const result = resolver.resolve(root.getContext(target), [], 'ctrl+c');
      return result.kind === ResultKind.KbFound ? result.commandId : undefined;
    };

    assert.deepStrictEqual(
      [
        commandOf(null),
        (listFocus.set(true), commandOf(listEl)),
        (listFocus.set(false), commandOf(input)), // 이름 편집 중
      ],
      ['edit.copy.cmd', 'list.copy.cmd', 'edit.copy.cmd']
    );
  });

  it('converts dispatch string to electron accelerator', function () {
    assert.deepStrictEqual(
      [
        toElectronAccelerator(['meta+x']),
        toElectronAccelerator(['meta+backspace']),
        toElectronAccelerator(['delete']),
        toElectronAccelerator(['ctrl+shift+v']),
        toElectronAccelerator(['ctrl+k', 'ctrl+s']),
      ],
      ['Cmd+X', 'Cmd+Backspace', 'Delete', 'Ctrl+Shift+V', undefined]
    );
  });
});
