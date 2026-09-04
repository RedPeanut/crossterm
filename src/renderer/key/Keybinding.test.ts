import assert from 'assert';
import { ContextKeyExpr } from './ContextKey';
import { ContextKeyService } from '../service/ContextKeyService';
import { parseKeybinding } from './Keybindings';
import { KeybindingResolver, ResultKind } from './KeybindingResolver';
import { KeybindingWeight, toUserKeybindingItems } from './KeybindingsRegistry';
import { commandsRegistry } from '../globals';

describe('#Keybinding', function () {

  function resolverOf(rules: Parameters<typeof toUserKeybindingItems>[0]) {
    return new KeybindingResolver(toUserKeybindingItems(rules));
  }

  it('resolves single chord, honours when clause', function () {
    const resolver = resolverOf([
      { id: 'pane.close', weight: KeybindingWeight.Core, primary: 'ctrl+w', when: ContextKeyExpr.has('paneFocused') },
    ]);
    const contextKeyService = new ContextKeyService();
    const paneFocused = contextKeyService.createKey<boolean>('paneFocused', false);

    assert.deepStrictEqual(
      [
        resolver.resolve(contextKeyService.getContext(), [], 'ctrl+w').kind,
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
