import ko from './i18n/ko.json';

/**
 * 다국어(nls) 지원.
 * (VSCode base/common/nls 의 localize 를 단순화한 형태)
 *
 * - 영어 기본 문구는 코드에 그대로 두고, 번역은 `i18n/<locale>.json` 에 key -> 문구로 둔다.
 * - 번역이 없으면 기본 문구를 쓴다.
 * - `{0}`, `{1}` ... 은 args 로 치환한다. 어순이 언어마다 다르므로 문자열을 이어 붙이지 말 것.
 *
 * Note. localize 는 호출 시점의 로케일로 번역한다. 모듈 최상위에서 호출하는 코드(menus.ts 등)가 있으므로
 *       setLocale 은 그런 모듈이 로드되기 전에 불러야 한다. (main: 메뉴 생성 전, renderer: nls.init.ts)
 */

export const defaultLocale = 'en';

/** main -> renderer(preload) 로케일 전달용 인자. webPreferences.additionalArguments 로 넘긴다. */
export const localeArgPrefix = '--crossterm-locale=';

const bundles: { [locale: string]: Record<string, string> } = {
  ko,
};

export const supportedLocales: string[] = [defaultLocale, ...Object.keys(bundles)];

let currentLocale = defaultLocale;
let messages: Record<string, string> = {};

/**
 * 'ko-KR', 'ko_KR', 'KO' 같은 값을 지원 로케일로 맞춘다. 지원하지 않으면 defaultLocale.
 */
export function resolveLocale(locale: string | undefined | null): string {
  if (!locale) return defaultLocale;
  const normalized = locale.replace('_', '-').toLowerCase();
  if (supportedLocales.includes(normalized)) return normalized;
  const language = normalized.split('-')[0];
  if (supportedLocales.includes(language)) return language;
  return defaultLocale;
}

export function setLocale(locale: string): void {
  currentLocale = resolveLocale(locale);
  messages = bundles[currentLocale] || {};
}

export function getLocale(): string {
  return currentLocale;
}

export function localize(key: string, defaultMessage: string, ...args: (string | number | boolean)[]): string {
  const message: string = messages[key] ?? defaultMessage;
  if (args.length === 0) return message;
  return message.replace(/\{(\d+)\}/g, (match, index) => {
    const arg = args[Number(index)];
    return arg === undefined ? match : String(arg);
  });
}
