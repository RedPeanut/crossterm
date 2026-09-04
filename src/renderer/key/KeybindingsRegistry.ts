import { isLinux, isMacintosh, isWindows } from '../../common/base/platform';
import { commandsRegistry } from '../globals';
import { CommandHandler } from './CommandsRegistry';
// import { CommandHandler } from './CommandService';
import { ContextKeyExpr, ContextKeyExpression } from './ContextKey';
import { parseKeybinding } from './Keybinding';

/**
 * VSCode의 `vs/platform/keybinding/common/keybindingsRegistry.ts`를 최소 형태로 옮긴 것.
 * 기본 키바인딩을 전역 레지스트리에 모아두고, resolver가 이걸 받아 룩업 테이블을 만든다.
 */

/** 같은 키에 여러 룰이 걸렸을 때의 우선순위. 숫자가 크면 나중에(=더 우선하여) 적용된다. */
export const enum KeybindingWeight {
  Core = 0,
  Contrib = 200,
  ExternalExtension = 400,
  UserSetting = 1000,
}

export interface KeybindingRule {
  readonly id: string;
  readonly weight: number;
  /** 예: `'mod+shift+p'`, `'ctrl+k ctrl+s'` */
  readonly primary?: string;
  readonly secondary?: string[];
  /** 플랫폼 오버라이드. `null`을 주면 해당 플랫폼에서는 바인딩하지 않는다. */
  readonly mac?: string | null;
  readonly win?: string | null;
  readonly linux?: string | null;
  readonly when?: ContextKeyExpression | string;
  readonly args?: unknown;
}

/** resolver가 다루는 최종 형태. chords는 dispatch 문자열 배열. */
export interface ResolvedKeybindingItem {
  readonly chords: readonly string[];
  readonly command: string;
  readonly commandArgs: unknown;
  readonly when: ContextKeyExpression | undefined;
  readonly weight: number;
  readonly order: number;
  readonly isDefault: boolean;
  /** UI 표시용 라벨. 예: `⇧⌘P` */
  readonly label: string;
}

export class KeybindingsRegistryImpl {
  private readonly _items: ResolvedKeybindingItem[] = [];
  private _order = 0;

  registerKeybindingRule(rule: KeybindingRule): void {
    for (const keybinding of resolvePlatformKeybindings(rule)) {
      const item = toResolvedItem(rule, keybinding, /* isDefault */ true, ++this._order);
      if (item) {
        this._items.push(item);
      }
    }
  }

  /** 커맨드 등록 + 키바인딩 등록을 한 번에. contrib 파일에서 가장 많이 쓰는 형태. */
  registerCommandAndKeybindingRule(rule: KeybindingRule & { handler: CommandHandler }): void {
    commandsRegistry.registerCommand(rule.id, rule.handler);
    this.registerKeybindingRule(rule);
  }

  /** weight -> 등록 순서로 오름차순 정렬. resolver는 뒤에 있는 항목을 먼저 본다. */
  getDefaultKeybindings(): ResolvedKeybindingItem[] {
    return this._items.slice().sort((a, b) => a.weight !== b.weight ? a.weight - b.weight : a.order - b.order);
  }
}

/** 사용자 설정(keybindings.json 등)에서 읽은 룰을 resolver 입력으로 변환한다. */
export function toUserKeybindingItems(rules: KeybindingRule[]): ResolvedKeybindingItem[] {
  const items: ResolvedKeybindingItem[] = [];
  let order = 0;
  for (const rule of rules) {
    for (const keybinding of resolvePlatformKeybindings(rule)) {
      const item = toResolvedItem({ ...rule, weight: KeybindingWeight.UserSetting }, keybinding, /* isDefault */ false, ++order);
      if (item) {
        items.push(item);
      }
    }
  }
  return items;
}

function resolvePlatformKeybindings(rule: KeybindingRule): string[] {
  const platformOverride = isMacintosh ? rule.mac : (isWindows ? rule.win : (isLinux ? rule.linux : undefined));
  if (platformOverride === null) {
    return []; // 이 플랫폼에서는 바인딩 없음
  }
  const primary = platformOverride ?? rule.primary;
  return [primary, ...(rule.secondary ?? [])].filter((k): k is string => !!k);
}

function toResolvedItem(rule: KeybindingRule, rawKeybinding: string, isDefault: boolean, order: number): ResolvedKeybindingItem | undefined {
  const keybinding = parseKeybinding(rawKeybinding);
  const chords = keybinding?.getDispatchChords();
  if (!keybinding || !chords) {
    console.warn(`[keybinding] cannot parse "${rawKeybinding}" for command "${rule.id}"`);
    return undefined;
  }
  return {
    chords,
    command: rule.id,
    commandArgs: rule.args,
    when: typeof rule.when === 'string' ? ContextKeyExpr.deserialize(rule.when) : rule.when,
    weight: rule.weight,
    order,
    isDefault,
    label: keybinding.getLabel(),
  };
}
