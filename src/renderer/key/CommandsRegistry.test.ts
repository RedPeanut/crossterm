import assert from 'assert';
import { commandsRegistry } from './CommandsRegistry';

describe('#CommandsRegistry', function() {

  it('getCommandTitle 은 제목이 없거나 없는 커맨드면 id 를 돌려준다', function() {
    const withTitle = commandsRegistry.registerCommand('test.titled', () => { }, () => 'Titled Command');
    const withoutTitle = commandsRegistry.registerCommand('test.untitled', () => { });
    try {
      assert.deepStrictEqual({
        titled: commandsRegistry.getCommandTitle('test.titled'),
        untitled: commandsRegistry.getCommandTitle('test.untitled'),
        unknown: commandsRegistry.getCommandTitle('test.unknown'),
      }, {
        titled: 'Titled Command',
        untitled: 'test.untitled',
        unknown: 'test.unknown',
      });
    } finally {
      withTitle.dispose();
      withoutTitle.dispose();
    }
  });
});
