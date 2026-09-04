/**
 * 터미널 관련 context key 이름.
 *
 * `when` 절에서 이 문자열을 그대로 쓴다. 예:
 *   when: '!terminalFocused'   // 터미널에 포커스가 없을 때만 동작하는 커맨드
 *
 * VSCode의 `contrib/terminal/common/terminalContextKey.ts`에 대응한다.
 */

export const terminalFocusedContextKeyName = 'terminalFocused';

/** 터미널에 선택 영역이 있는지. 예: `when: 'terminalFocused && terminalHasSelection'` */
export const terminalHasSelectionContextKeyName = 'terminalHasSelection';
