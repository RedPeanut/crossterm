import { isMacintosh } from '../../common/base/platform';
import { KeyName, MODIFIER_KEY_NAMES, ModifierKeyName, keyLabel, keyNameFromCode, modifierLabel } from './KeyCodes';

/**
 * VSCode의 `vs/base/common/keybindings.ts` + `keybindingParser.ts`를 최소 형태로 옮긴 것.
 *
 * 용어(VSCode와 동일):
 *  - Chord: 한 번의 키 조합. 예: `ctrl+k`
 *  - Keybinding: chord의 시퀀스. 예: `ctrl+k ctrl+s` (multi-chord keybinding)
 *  - dispatch 문자열: resolver의 map key로 쓰는 정규화 문자열. 항상 `ctrl+shift+alt+meta+key` 순서.
 */

/** 한 번의 키 조합. */
export class Chord {
  constructor(
    readonly ctrlKey: boolean,
    readonly shiftKey: boolean,
    readonly altKey: boolean,
    readonly metaKey: boolean,
    readonly keyName: KeyName
  ) { }

  static fromKeyboardEvent(e: KeyboardEvent): Chord | null {
    const keyName = keyNameFromCode(e.code);
    if (!keyName) {
      return null;
    }
    return new Chord(e.ctrlKey, e.shiftKey, e.altKey, e.metaKey, keyName);
  }

  /** resolver가 쓰는 정규화 문자열. 수식 키만 눌린 상태면 dispatch할 수 없으므로 null. */
  toDispatchString(): string | null {
    if (MODIFIER_KEY_NAMES.has(this.keyName)) {
      return null;
    }
    let result = '';
    if (this.ctrlKey) { result += 'ctrl+'; }
    if (this.shiftKey) { result += 'shift+'; }
    if (this.altKey) { result += 'alt+'; }
    if (this.metaKey) { result += 'meta+'; }
    return result + this.keyName;
  }

  /** UI 라벨. mac은 `⇧⌘P`, 그 외는 `Ctrl+Shift+P`. */
  toLabel(): string {
    const parts: ModifierKeyName[] = [];
    // mac 표기 관례상 ⌃⌥⇧⌘ 순서
    if (isMacintosh) {
      if (this.ctrlKey) { parts.push('ctrl'); }
      if (this.altKey) { parts.push('alt'); }
      if (this.shiftKey) { parts.push('shift'); }
      if (this.metaKey) { parts.push('meta'); }
    } else {
      if (this.ctrlKey) { parts.push('ctrl'); }
      if (this.shiftKey) { parts.push('shift'); }
      if (this.altKey) { parts.push('alt'); }
      if (this.metaKey) { parts.push('meta'); }
    }
    return parts.map(modifierLabel).join('') + keyLabel(this.keyName);
  }
}

/** chord 시퀀스. */
export class Keybinding {
  constructor(readonly chords: readonly Chord[]) { }

  /** 모든 chord가 dispatch 가능하면 문자열 배열, 하나라도 불가하면 null. */
  getDispatchChords(): string[] | null {
    const result: string[] = [];
    for (const chord of this.chords) {
      const dispatch = chord.toDispatchString();
      if (dispatch === null) {
        return null;
      }
      result.push(dispatch);
    }
    return result;
  }

  getLabel(): string {
    return this.chords.map(chord => chord.toLabel()).join(' ');
  }
}

/**
 * `'ctrl+shift+p'`, `'mod+k mod+s'` 같은 문자열을 파싱한다.
 *
 * 지원 별칭:
 *  - `mod` / `ctrlcmd`: mac에서는 `meta`(⌘), 그 외에서는 `ctrl`
 *  - `cmd` / `command` / `win` / `super`: `meta`
 *  - `control`: `ctrl`
 *  - `option`: `alt`
 */
export function parseKeybinding(input: string): Keybinding | null {
  const chords: Chord[] = [];
  for (const rawChord of input.trim().split(/\s+/)) {
    const chord = parseChord(rawChord);
    if (!chord) {
      return null;
    }
    chords.push(chord);
  }
  return chords.length > 0 ? new Keybinding(chords) : null;
}

function parseChord(input: string): Chord | null {
  let ctrl = false;
  let shift = false;
  let alt = false;
  let meta = false;
  let keyName: KeyName | null = null;

  // '+'가 키 이름 자체일 수도 있으므로 마지막 토큰은 남겨둔다.
  const parts = input.toLowerCase().split('+');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = (i === parts.length - 1);
    if (!isLast || part.length === 0) {
      switch (part) {
        case 'ctrl': case 'control': ctrl = true; break;
        case 'shift': shift = true; break;
        case 'alt': case 'option': alt = true; break;
        case 'meta': case 'cmd': case 'command': case 'win': case 'super': meta = true; break;
        case 'mod': case 'ctrlcmd': if (isMacintosh) { meta = true; } else { ctrl = true; } break;
        case '': keyName = '+'; break; // 'ctrl++' 같은 표기
        default: return null;
      }
    } else {
      keyName = part;
    }
  }

  return keyName ? new Chord(ctrl, shift, alt, meta, keyName) : null;
}
