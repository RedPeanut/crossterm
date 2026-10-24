import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { resolveLocale } from '../common/nls';

/**
 * 앱 로케일 결정.
 *
 * settings.json 의 `locale` 값("auto" 또는 미설정이면 OS 언어를 따른다)을 우선한다.
 * 렌더러에는 `--crossterm-locale=<locale>` 인자로 넘기고 preload 가 읽는다. (localeArgPrefix)
 */

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
    app.commandLine.appendSwitch('lang', userLocale);
  }
}

/**
 * 최종 로케일. app ready 이후에 부른다. (app.getLocale 은 ready 이후에만 유효)
 */
export function resolveAppLocale(): string {
  return resolveLocale(readUserLocale() ?? app.getLocale());
}
