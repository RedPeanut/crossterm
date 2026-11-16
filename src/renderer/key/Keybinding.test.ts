import assert from 'assert';
import { IContextKeyExpr, NSContextKeyExpr } from './ContextKey';
import { ContextKeyService } from '../service/ContextKeyService';
import { parseKeybinding } from './Keybinding';
import { KeybindingResolver, ResultKind } from './KeybindingResolver';
import { KeybindingWeight, toUserKeybindingItems } from './KeybindingsRegistry';
import { commandsRegistry } from './CommandsRegistry';
// import { commandsRegistry } from '../globals';

describe('#Keybinding', function () {

  function resolverOf(rules: Parameters<typeof toUserKeybindingItems>[0]) {
    return new KeybindingResolver(toUserKeybindingItems(rules));
  }

  it('resolves single chord, honours when clause', function () {
    const resolver = resolverOf([
      { id: 'pane.close', weight: KeybindingWeight.Core, primary: 'ctrl+w', when: NSContextKeyExpr.has('paneFocused') },
    ]);
    const contextKeyService = new ContextKeyService();
    const paneFocused = contextKeyService.createKey<boolean>('paneFocused', false);

    assert.deepStrictEqual(
      [
        resolver.resolve(contextKeyService.getContext(), [], 'ctrl+w').kind,
        // (a,b) 쉼표 연산자: a를 먼저 실행하고 b의 결과를 값으로 돌려줌
        (paneFocused.set(true), resolver.resolve(contextKeyService.getContext(), [], 'ctrl+w')),
      ],
      [
        ResultKind.NoMatchingKb,
        { kind: ResultKind.KbFound, commandId: 'pane.close', commandArgs: undefined },
      ]
    );
  });

  it('asks for more chords on a multi-chord prefix', function () {
    const resolver = resolverOf([
      { id: 'session.save', weight: KeybindingWeight.Core, primary: 'ctrl+k ctrl+s' },
    ]);
    const context = new ContextKeyService().getContext();

    assert.deepStrictEqual(
      [
        resolver.resolve(context, [], 'ctrl+k').kind,
        resolver.resolve(context, ['ctrl+k'], 'ctrl+s').kind,
        resolver.resolve(context, ['ctrl+k'], 'ctrl+x').kind,
      ],
      [ResultKind.MoreChordsNeeded, ResultKind.KbFound, ResultKind.NoMatchingKb]
    );
  });

  it('later rule with same weight wins', function () {
    const resolver = resolverOf([
      { id: 'first', weight: KeybindingWeight.Core, primary: 'ctrl+p' },
      { id: 'second', weight: KeybindingWeight.Core, primary: 'ctrl+p' },
    ]);
    const result = resolver.resolve(new ContextKeyService().getContext(), [], 'ctrl+p');

    assert.deepStrictEqual(result, { kind: ResultKind.KbFound, commandId: 'second', commandArgs: undefined });
  });

  it("'-command' removal rule removes matching default keybindings only", function () {
    const defaults = toUserKeybindingItems([
      { id: 'a.cmd', weight: KeybindingWeight.Core, primary: 'ctrl+a', secondary: ['ctrl+shift+a'] },
      { id: 'b.cmd', weight: KeybindingWeight.Core, primary: 'ctrl+b', when: 'paneFocused' },
      { id: 'c.cmd', weight: KeybindingWeight.Core, primary: 'ctrl+c', secondary: ['ctrl+k ctrl+c'] },
      { id: 'e.cmd', weight: KeybindingWeight.Core, primary: 'ctrl+e', when: 'paneFocused' },
    ]).map(item => ({ ...item, isDefault: true }));
    const [removeAllOfC] = toUserKeybindingItems([{ id: '-c.cmd', weight: 0, primary: 'ctrl+c' }]).map(item => ({ ...item, chords: [] }));
    const overrides = [
      ...toUserKeybindingItems([
        { id: '-a.cmd', weight: 0, primary: 'ctrl+a' }, // 키가 같은 것만 -> ctrl+shift+a 는 남는다
        { id: 'a.cmd', weight: 0, primary: 'ctrl+alt+a' },
        { id: '-b.cmd', weight: 0, primary: 'ctrl+b', when: 'listFocus' }, // when 이 달라 지우지 않는다
        { id: 'd.cmd', weight: 0, primary: 'ctrl+d' },
        { id: '-d.cmd', weight: 0, primary: 'ctrl+d' }, // 사용자 키바인딩은 지우지 않는다
        { id: '-e.cmd', weight: 0, primary: 'ctrl+e' }, // when 이 없으면 when 과 상관없이 지운다
      ]),
      removeAllOfC, // 키가 없으면 그 커맨드의 기본 키바인딩 모두
    ];
    const resolver = new KeybindingResolver(defaults, overrides);
    const keybindingsOf = (command: string) => resolver.lookupKeybindings(command).map(item => item.chords.join(' '));

    assert.deepStrictEqual(
      Object.fromEntries(['a.cmd', 'b.cmd', 'c.cmd', 'd.cmd', 'e.cmd', '-a.cmd'].map(command => [command, keybindingsOf(command)])),
      {
        'a.cmd': ['ctrl+shift+a', 'ctrl+alt+a'],
        'b.cmd': ['ctrl+b'],
        'c.cmd': [],
        'd.cmd': ['ctrl+d'],
        'e.cmd': [],
        '-a.cmd': [],
      }
    );
  });

  it('scoped context only applies below its DOM node', function () {
    const root = new ContextKeyService();
    root.createKey('paneFocused', false);
    const child = document.createElement('div');
    const grandChild = document.createElement('span');
    child.appendChild(grandChild);
    const scoped = root.createScoped(child);
    scoped.createKey('paneFocused', true);

    assert.deepStrictEqual(
      [
        root.getContext(null).getValue('paneFocused'),
        root.getContext(grandChild).getValue('paneFocused'),
      ],
      [false, true]
    );
  });

  it("expands 'mod' per platform and keeps chord order", function () {
    const chords = parseKeybinding('mod+k mod+s')?.getDispatchChords();

    assert.deepStrictEqual(chords, process.platform === 'darwin' ? ['meta+k', 'meta+s'] : ['ctrl+k', 'ctrl+s']);
  });

  it('registers command handlers by id', async function () {
    const calls: unknown[][] = [];
    commandsRegistry.registerCommand('test.echo', (...args) => { calls.push(args); return 'ok'; });

    assert.deepStrictEqual(commandsRegistry.getCommand('test.echo')?.handler('a', 1), 'ok');
    assert.deepStrictEqual(calls, [['a', 1]]);
  });

});
