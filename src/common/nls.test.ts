import { resolveLocale, setLocale, getLocale, localize } from './nls';

describe('nls', () => {
  afterEach(() => setLocale('en'));

  test('resolveLocale', () => {
    expect(resolveLocale('ko')).toBe('ko');
    expect(resolveLocale('ko-KR')).toBe('ko');
    expect(resolveLocale('ko_KR')).toBe('ko');
    expect(resolveLocale('KO')).toBe('ko');
    expect(resolveLocale('en-US')).toBe('en');
    expect(resolveLocale('fr')).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
  });

  test('번역이 없으면 기본 문구', () => {
    setLocale('ko');
    expect(getLocale()).toBe('ko');
    expect(localize('nls.test.missing', 'Missing')).toBe('Missing');
  });

  test('번역이 있으면 번역 문구', () => {
    setLocale('ko');
    expect(localize('nls.later', 'Later')).toBe('나중에');
    setLocale('en');
    expect(localize('nls.later', 'Later')).toBe('Later');
  });

  test('인자 치환', () => {
    expect(localize('x', 'Cannot read {0}', '/a/b')).toBe('Cannot read /a/b');
    expect(localize('x', '{1} and {0}', 'a', 'b')).toBe('b and a');
    expect(localize('x', 'keep {2}', 'a')).toBe('keep {2}');
  });
});
