import { Context, ContextKeyExpression } from './ContextKey';
import { ResolvedKeybindingItem } from './KeybindingsRegistry';

/**
 * VSCode의 `vs/platform/keybinding/common/keybindingResolver.ts`를 최소 형태로 옮긴 것.
 *
 * 역할: "지금까지 눌린 chord들 + 방금 누른 chord"를 받아
 *  - 아무것도 안 걸림(NoMatchingKb)
 *  - 더 눌러야 함(MoreChordsNeeded) -> 이게 `ctrl+k ctrl+s` 같은 chord 모드의 근거
 *  - 실행할 커맨드 확정(KbFound)
 * 중 하나로 판정한다.
 *
 * 원본과 비교해 의도적으로 뺀 것:
 *  - `-commandId` 형태의 기본 바인딩 제거(handleRemovals)
 *  - when 절 함의 판정(implies)을 이용한 lookupMap 정리
 */

export const enum ResultKind {
  /** 이 chord 시퀀스에 걸린 키바인딩이 없다. */
  NoMatchingKb,
  /** 이 시퀀스를 prefix로 갖는 키바인딩이 있다. 다음 chord를 기다려야 한다. */
  MoreChordsNeeded,
  /** 실행할 키바인딩이 확정됐다. */
  KbFound,
}

export type ResolutionResult =
  | { kind: ResultKind.NoMatchingKb }
  | { kind: ResultKind.MoreChordsNeeded }
  | { kind: ResultKind.KbFound; commandId: string; commandArgs: unknown };

const NoMatchingKb: ResolutionResult = { kind: ResultKind.NoMatchingKb };
const MoreChordsNeeded: ResolutionResult = { kind: ResultKind.MoreChordsNeeded };

export class KeybindingResolver {
  /** 첫 chord -> 후보 목록. 우선순위가 낮은 것부터 담긴다(뒤에서부터 탐색). */
  private readonly _map = new Map<string, ResolvedKeybindingItem[]>();
  private readonly _lookupMap = new Map<string, ResolvedKeybindingItem[]>();

  constructor(defaultKeybindings: readonly ResolvedKeybindingItem[], overrides: readonly ResolvedKeybindingItem[] = []) {
    for (const item of [...defaultKeybindings, ...overrides]) {
      if (item.chords.length === 0) {
        continue;
      }
      const first = item.chords[0];
      const bucket = this._map.get(first);
      if (bucket) {
        bucket.push(item);
      } else {
        this._map.set(first, [item]);
      }

      const lookup = this._lookupMap.get(item.command);
      if (lookup) {
        lookup.push(item);
      } else {
        this._lookupMap.set(item.command, [item]);
      }
    }
  }

  /**
   * `[...currentChords, keypress]` 시퀀스를 판정한다.
   * 예: `currentChords = ['ctrl+k']`, `keypress = 'ctrl+s'`
   */
  resolve(context: Context, currentChords: readonly string[], keypress: string): ResolutionResult {
    const pressedChords = [...currentChords, keypress];

    const candidates = this._map.get(pressedChords[0]);
    if (!candidates) {
      return NoMatchingKb;
    }

    // 지금까지 누른 chord들을 prefix로 갖는 후보만 남긴다.
    const matching = pressedChords.length < 2 ? candidates : candidates.filter(candidate => {
      if (pressedChords.length > candidate.chords.length) {
        return false;
      }
      for (let i = 1; i < pressedChords.length; i++) {
        if (candidate.chords[i] !== pressedChords[i]) {
          return false;
        }
      }
      return true;
    });

    // when 절이 맞는 것 중 가장 우선순위가 높은 것(=가장 나중에 등록된 것)
    const found = this._findCommand(context, matching);
    if (!found) {
      return NoMatchingKb;
    }

    // 아직 chord가 부족하면 다음 입력을 기다린다.
    if (pressedChords.length < found.chords.length) {
      return MoreChordsNeeded;
    }

    return { kind: ResultKind.KbFound, commandId: found.command, commandArgs: found.commandArgs };
  }

  private _findCommand(context: Context, matches: readonly ResolvedKeybindingItem[]): ResolvedKeybindingItem | undefined {
    for (let i = matches.length - 1; i >= 0; i--) {
      if (contextMatchesRules(context, matches[i].when)) {
        return matches[i];
      }
    }
    return undefined;
  }

  /** 커맨드 id로 걸린 키바인딩을 찾는다(메뉴/툴팁에 단축키를 표시할 때 사용). */
  lookupKeybindings(commandId: string): readonly ResolvedKeybindingItem[] {
    return this._lookupMap.get(commandId) ?? [];
  }

  /** 지금 context에서 유효한 대표 키바인딩 하나. */
  lookupPrimaryKeybinding(commandId: string, context: Context): ResolvedKeybindingItem | undefined {
    const items = this._lookupMap.get(commandId);
    if (!items || items.length === 0) {
      return undefined;
    }
    return this._findCommand(context, items) ?? items[items.length - 1];
  }
}

function contextMatchesRules(context: Context, rules: ContextKeyExpression | undefined): boolean {
  return rules ? rules.evaluate(context) : true;
}
