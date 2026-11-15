import { configurationRegistry, ConfigurationRegistryImpl, ConfigurationPropertySchema } from './ConfigurationRegistry';

function schema(defaultValue: number): ConfigurationPropertySchema {
  return { type: 'number', default: defaultValue, title: () => '', description: () => '' };
}

describe('ConfigurationRegistry', () => {

  test.skip('default configuration of built-in settings', () => {
    // console.log(configurationRegistry.getDefaultConfiguration());

    expect(configurationRegistry.getDefaultConfiguration()).toEqual({
      locale: 'auto',
      workbench: { colorTheme: 'dark' },
      terminal: { fontFamily: '', fontSize: 13 },
    });
  });

  test.skip('built-in enum descriptions match enum values', () => {
    // console.log(configurationRegistry.getConfigurationProperties());
    // console.log(configurationRegistry.getConfigurationProperties()['locale'].enumDescriptions?.());

    const mismatched = Object.entries(configurationRegistry.getConfigurationProperties())
      .filter(([, property]) => property.enum && property.enumDescriptions?.().length !== property.enum.length)
      .map(([key]) => key);
    expect({ mismatched, locale: configurationRegistry.getConfigurationProperties()['locale'].enumDescriptions?.() })
      .toEqual({ mismatched: [], locale: ['Use the operating system language', 'English', '한국어'] });
  });

  test.skip('nodes are ordered by order, then registration order', () => {
    const registry = new ConfigurationRegistryImpl();
    registry.registerConfiguration({ id: 'c', title: () => '', properties: { 'c.x': schema(3) } });
    registry.registerConfiguration({ id: 'b', title: () => '', order: 2, properties: { 'b.x': schema(2) } });
    registry.registerConfiguration({ id: 'a', title: () => '', order: 1, properties: { 'a.x': schema(1), 'a.y': schema(4) } });

    expect({
      ids: registry.getConfigurationNodes().map(node => node.id),
      keys: Object.keys(registry.getConfigurationProperties()),
      defaults: registry.getDefaultConfiguration(),
    }).toEqual({
      ids: ['a', 'b', 'c'],
      keys: ['c.x', 'b.x', 'a.x', 'a.y'],
      defaults: { a: { x: 1, y: 4 }, b: { x: 2 }, c: { x: 3 } },
    });
  });

  test('registering a duplicate key throws and registers nothing', () => {
    const registry = new ConfigurationRegistryImpl();
    registry.registerConfiguration({ id: 'a', title: () => '', properties: { 'a.x': schema(1) } });
    // registry.registerConfiguration({ id: 'b', title: () => '', properties: { 'b.x': schema(2), 'a.x': schema(3) } });

    expect(() => registry.registerConfiguration({ id: 'b', title: () => '', properties: { 'b.x': schema(2), 'a.x': schema(3) } }))
      .toThrow(/a\.x/);
    expect(registry.getDefaultConfiguration()).toEqual({ a: { x: 1 } });
  });
});
