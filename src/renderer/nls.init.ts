import { getLocale, setLocale } from '../common/nls';

/**
 * 렌더러 로케일 초기화.
 *
 * Note. menus.ts 처럼 모듈 최상위에서 localize 를 부르는 코드가 있으므로,
 *       index.ts 에서 다른 모듈보다 먼저 import 해야 한다. (import 는 선언 순서대로 평가된다)
 */
setLocale(window.ipc.locale);
document.documentElement.lang = getLocale();
