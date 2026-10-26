import path from 'path';
import fs from 'fs';
import { app, systemPreferences } from 'electron';
import { resolveLocale } from '../common/nls';

/**
 * 앱 로케일 결정.
 *
 * settings.json 의 `locale` 값("auto" 또는 미설정이면 OS 언어를 따른다)을 우선한다.
 * 렌더러에는 `--crossterm-locale=<locale>` 인자로 넘기고 preload 가 읽는다. (localeArgPrefix)
 */

/** syncAppleLanguages 가 AppleLanguages 에 써둔 값. 사용자가 macOS 설정에서 직접 고른 값과 구분하기 위해 둔다. */
const managedAppleLanguagesKey = 'CrosstermManagedAppleLanguage';

/**
 * 사용자가 지정한 로케일. 지정하지 않았거나 "auto" 면 undefined.
 *
 * Note. app ready 전에 불러야 해서(`--lang` 스위치) ConfigurationService 를 쓰지 않고 파일을 직접 동기로 읽는다.
 */
export function readUserLocale(): string | undefined {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    const content = fs.readFileSync(settingsPath, 'utf8').trim();
    const locale = content ? JSON.parse(content).locale : undefined;
    return typeof locale === 'string' && locale !== 'auto' ? locale : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Chromium 로케일(기본 컨텍스트 메뉴, 맞춤법 검사, app.getLocale 등)을 맞춘다.
 * app ready 전에 불러야 효과가 있다.
 */
export function configureLocaleSwitch(): void {
  const userLocale = readUserLocale();
  if (userLocale) {
    app.commandLine.appendSwitch('lang', resolveLocale(userLocale));
  }
  syncAppleLanguages();
}

/**
 * macOS 가 그리는 부분(서비스 메뉴, 편집 메뉴의 받아쓰기/이모티콘 항목, 네이티브 대화상자 기본 버튼 등)은
 * `--lang` 이 아니라 앱 도메인의 AppleLanguages 와 번들의 lproj(electronLanguages) 를 따른다.
 * 그래서 사용자 설정을 AppleLanguages 에 맞춰 둔다.
 *
 * Note. AppleLanguages 는 프로세스 시작 시 읽히므로 바꾼 값은 다음 실행부터 적용된다.
 *       설정이 바뀔 때 바로 불러야 "나중에 다시 시작" 한 경우에도 다음 실행에 반영된다.
 * Note. "auto" 로 돌아가면 우리가 썼던 값만 지운다. macOS 설정 > 언어 및 지역 > 앱별 언어로
 *       사용자가 직접 고른 값(같은 AppleLanguages 키)은 건드리지 않는다.
 */
export function syncAppleLanguages(): void {
  if (process.platform !== 'darwin') return;

  const userLocale = readUserLocale();
  if (userLocale) {
    const locale = resolveLocale(userLocale);
    systemPreferences.setUserDefault('AppleLanguages', 'array', [locale]);
    systemPreferences.setUserDefault(managedAppleLanguagesKey, 'string', locale);
    return;
  }

  const managed = systemPreferences.getUserDefault(managedAppleLanguagesKey, 'string');
  if (!managed) return;

  const current = systemPreferences.getUserDefault('AppleLanguages', 'array');
  if (current.length === 1 && current[0] === managed) {
    systemPreferences.removeUserDefault('AppleLanguages');
  }
  systemPreferences.removeUserDefault(managedAppleLanguagesKey);
}

/**
 * 최종 로케일. app ready 이후에 부른다. (app.getLocale 은 ready 이후에만 유효)
 */
export function resolveAppLocale(): string {
  return resolveLocale(readUserLocale() ?? app.getLocale());
}
