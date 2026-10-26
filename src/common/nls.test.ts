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

describe('ko.json', () => {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const ko: Record<string, string> = require('./i18n/ko.json');

  /** 소스 전체에서 localize('key', 'default' ...) 호출을 모은다 */
  function collectLocalizeCalls(): Map<string, string[]> {
    const calls = new Map<string, string[]>();
    const re = /localize\(\s*(['"])(?<key>[^'"]+)\1\s*,\s*(?<quote>['"])(?<message>(?:\\.|(?!\k<quote>).)*)\k<quote>/g;
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.ts$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) {
          for (const m of fs.readFileSync(p, 'utf8').matchAll(re)) {
            const { key, message } = m.groups!;
            calls.set(key, [...(calls.get(key) ?? []), message]);
          }
        }
      }
    };
    walk(path.join(__dirname, '..'));
    return calls;
  }

  const placeholders = (s: string) => [...new Set(s.match(/\{\d+\}/g) ?? [])].sort();

  const calls = collectLocalizeCalls();

  test('코드의 key 는 모두 번역되어 있고, ko.json 에 안 쓰는 key 가 없다', () => {
    expect([...calls.keys()].filter(k => !(k in ko))).toEqual([]);
    expect(Object.keys(ko).filter(k => !calls.has(k))).toEqual([]);
  });

  test('같은 key 는 같은 기본 문구를 쓴다', () => {
    const mismatched = [...calls].filter(([, messages]) => new Set(messages).size > 1);
    expect(mismatched).toEqual([]);
  });

  test('번역과 기본 문구의 자리표시자가 같다', () => {
    const mismatched = [...calls]
      .filter(([key, [message]]) => key in ko && placeholders(ko[key]).join() !== placeholders(message).join())
      .map(([key]) => key);
    expect(mismatched).toEqual([]);
  });
});
