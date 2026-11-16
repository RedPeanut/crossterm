import { Event } from '../base/event';

/**
 * keybindings.json 의 항목 하나. (VSCode의 IUserFriendlyKeybinding)
 *
 * `command`가 `-`로 시작하면(예: `-app.settings.cmd`) 해당 기본 키바인딩을 제거하는 룰이다.
 */
export interface UserKeybindingEntry {
  /** 예: `'mod+k mod+s'` */
  readonly key: string;
  readonly command: string;
  readonly when?: string;
  readonly args?: unknown;
}

/**
 * 사용자 키바인딩(`userData/keybindings.json`)을 읽고 쓰는 서비스.
 * 파일 전체를 배열 하나로 다루며, 부분 수정은 호출하는 쪽에서 배열을 만들어 통째로 저장한다.
 */
export interface UserKeybindingsService {
  /** 내용이 바뀌면 발생한다. */
  readonly onDidChange: Event<void>;
  getKeybindings(): Promise<UserKeybindingEntry[]>;
  setKeybindings(entries: readonly UserKeybindingEntry[]): Promise<void>;
}

/**
 * 알 수 없는 값(파싱된 JSON 등)에서 올바른 항목만 골라낸다.
 * 배열이 아니면 빈 배열, 형식이 깨진 항목은 버린다.
 */
export function sanitizeUserKeybindings(value: unknown): UserKeybindingEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: UserKeybindingEntry[] = [];
  for (const item of value) {
    if (!isUserKeybindingEntry(item)) {
      console.warn('[keybindings] invalid entry is ignored', item);
      continue;
    }
    // 알 수 없는 속성은 버리고, 없는 선택 속성은 키 자체를 만들지 않는다.
    result.push({
      key: item.key,
      command: item.command,
      ...(item.when !== undefined ? { when: item.when } : {}),
      ...(item.args !== undefined ? { args: item.args } : {}),
    });
  }
  return result;
}

function isUserKeybindingEntry(item: unknown): item is UserKeybindingEntry {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const { key, command, when } = item as Record<string, unknown>;
  return typeof key === 'string' && key.trim().length > 0
    && typeof command === 'string' && command.length > 0
    && (when === undefined || typeof when === 'string');
}
