/**
 * Electron 타입 확장.
 *
 * Electron의 MenuItemConstructorOptions는 전역 `namespace Electron`에 선언되어 있고
 * 'electron' 모듈은 그것의 타입 별칭만 export 하므로, 전역 네임스페이스를 확장하면
 * `import { MenuItemConstructorOptions } from 'electron'` 쪽에도 그대로 반영된다.
 *
 * 주의: `commandId`는 Electron MenuItem이 내부적으로 사용하는 예약 속성(number)이므로
 * 재사용할 수 없다. 커스텀 키는 반드시 Electron이 쓰지 않는 이름을 써야 하며,
 * 그런 키는 런타임에 네이티브로 전달되지 않고 무시된다.
 */
declare namespace Electron {
  interface MenuItemConstructorOptions {
    appCommandId?: string;
  }
}
