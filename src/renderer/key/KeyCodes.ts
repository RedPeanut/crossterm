import { isMacintosh } from '../../common/base/platform';

/**
 * VSCode의 `vs/base/common/keyCodes.ts`를 최소 형태로 옮긴 것.
 *
 * VSCode는 숫자 KeyCode enum + 플랫폼별 키보드 레이아웃 매퍼(keyboardMapper)를 쓰지만,
 * 여기서는 US 레이아웃을 가정하고 `KeyboardEvent.code`를 그대로 정규화된
 * 소문자 키 이름('a', 'f1', 'escape', '[' ...)으로 바꾼다.
 * 비-US 레이아웃까지 정확히 지원해야 할 때 이 파일만 교체하면 된다.
 */

/** 정규화된 키 이름. dispatch 문자열과 `keybindings.json` 표기에 함께 쓰인다. */
export type KeyName = string;

export type ModifierKeyName = 'ctrl' | 'shift' | 'alt' | 'meta';

export const MODIFIER_KEY_NAMES: ReadonlySet<string> = new Set<ModifierKeyName>(['ctrl', 'shift', 'alt', 'meta']);

const CODE_TO_KEY_NAME = new Map<string, KeyName>([
  ['Escape', 'escape'],
  ['Enter', 'enter'],
  ['NumpadEnter', 'enter'],
  ['Space', 'space'],
  ['Tab', 'tab'],
  ['Backspace', 'backspace'],
  ['Delete', 'delete'],
  ['Insert', 'insert'],
  ['Home', 'home'],
  ['End', 'end'],
  ['PageUp', 'pageup'],
  ['PageDown', 'pagedown'],
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  // US 레이아웃 기호 키
  ['Minus', '-'],
  ['Equal', '='],
  ['BracketLeft', '['],
  ['BracketRight', ']'],
  ['Backslash', '\\'],
  ['Semicolon', ';'],
  ['Quote', "'"],
  ['Backquote', '`'],
  ['Comma', ','],
  ['Period', '.'],
  ['Slash', '/'],
  // 수식 키 자체
  ['ControlLeft', 'ctrl'],
  ['ControlRight', 'ctrl'],
  ['ShiftLeft', 'shift'],
  ['ShiftRight', 'shift'],
  ['AltLeft', 'alt'],
  ['AltRight', 'alt'],
  ['MetaLeft', 'meta'],
  ['MetaRight', 'meta'],
]);

/** `KeyboardEvent.code` -> 정규화된 키 이름. 모르는 키는 null. */
export function keyNameFromCode(code: string): KeyName | null {
  const known = CODE_TO_KEY_NAME.get(code);
  if (known) {
    return known;
  }
  if (/^Key[A-Z]$/.test(code)) {
    return code.charAt(3).toLowerCase();
  }
  if (/^Digit[0-9]$/.test(code)) {
    return code.charAt(5);
  }
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) {
    return code.toLowerCase();
  }
  return null;
}

const KEY_LABELS = new Map<KeyName, string>([
  ['up', isMacintosh ? '↑' : 'Up'],
  ['down', isMacintosh ? '↓' : 'Down'],
  ['left', isMacintosh ? '←' : 'Left'],
  ['right', isMacintosh ? '→' : 'Right'],
  ['pageup', 'PageUp'],
  ['pagedown', 'PageDown'],
]);

/** UI에 보여줄 키 라벨. 예: 'a' -> 'A', 'escape' -> 'Escape' */
export function keyLabel(keyName: KeyName): string {
  const special = KEY_LABELS.get(keyName);
  if (special) {
    return special;
  }
  if (keyName.length === 1) {
    return keyName.toUpperCase();
  }
  return keyName.charAt(0).toUpperCase() + keyName.slice(1);
}

/** 수식 키 라벨. mac은 기호, 그 외는 텍스트. */
export function modifierLabel(modifier: ModifierKeyName): string {
  if (isMacintosh) {
    switch (modifier) {
      case 'ctrl': return '⌃';
      case 'shift': return '⇧';
      case 'alt': return '⌥';
      case 'meta': return '⌘';
    }
  }
  switch (modifier) {
    case 'ctrl': return 'Ctrl+';
    case 'shift': return 'Shift+';
    case 'alt': return 'Alt+';
    case 'meta': return 'Super+';
  }
}
