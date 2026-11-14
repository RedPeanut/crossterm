/**
 * @jest-environment node
 */
import { deserialize, serialize } from 'v8';
import { createChangeEvent, serializeChangeEvent } from './ConfigurationService';

describe('ConfigurationService change event', () => {

  test('serialized change survives structured clone and is rebuilt', () => {
    const original = createChangeEvent(['terminal.fontSize', 'locale']);
    // Electron IPC와 같은 v8 structured clone 직렬화를 거친 상태를 만든다.
    const cloned = deserialize(serialize(serializeChangeEvent(original)));
    const rebuilt = createChangeEvent(cloned.affectedKeys);

    expect({
      keys: rebuilt.affectedKeys,
      terminal: rebuilt.affectsConfiguration('terminal'),
      fontSize: rebuilt.affectsConfiguration('terminal.fontSize'),
      fontSizeChild: rebuilt.affectsConfiguration('terminal.fontSize.x'),
      locale: rebuilt.affectsConfiguration('locale'),
      theme: rebuilt.affectsConfiguration('workbench'),
      prefixOnly: rebuilt.affectsConfiguration('term'),
    }).toEqual({
      keys: ['terminal.fontSize', 'locale'],
      terminal: true,
      fontSize: true,
      fontSizeChild: true,
      locale: true,
      theme: false,
      prefixOnly: false,
    });
  });

  test('raw change event cannot be structured cloned', () => {
    expect(() => serialize(createChangeEvent(['locale']))).toThrow(/could not be cloned/);
  });
});
