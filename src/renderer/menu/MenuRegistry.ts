import { Emitter, Event } from '../../common/base/event';
import { IDisposable } from '../../common/base/lifecycle';
import { SerializableMenuItem } from '../../common/Types';
import { commandsRegistry } from '../key/CommandsRegistry';
import { Context, ContextKeyExpr, ContextKeyExpression } from '../key/ContextKey';

/**
 * VSCode의 `vs/platform/actions/common/actions.ts`(MenuId, MenuRegistry)를 최소 형태로 옮긴 것.
 *
 * 메뉴는 "어느 메뉴(MenuId)에, 어떤 커맨드를, 어느 그룹/순서로 넣을지"만 선언한다.
 * 단축키/활성화/체크 여부는 resolveMenu 시점에 계산하므로 UI 메뉴바와 네이티브 메뉴가 같은 결과를 공유한다.
 *
 *   menuRegistry.appendMenuItem(MenuId.MenubarTabMenu, { command: { id, title }, group: '1_align' })
 *     -> resolveMenu(MenuId.MenubarMainMenu, context, lookupAccelerator)
 *     -> SerializableMenuItem[] (UI 메뉴바가 그대로 렌더링 / ipc로 main에 넘겨 Menu.buildFromTemplate)
 *
 * 원본과 비교해 의도적으로 뺀 것:
 *  - IMenu/MenuItemAction 객체(메뉴별 onDidChange 구독), alt 커맨드, icon, 다국어 title
 */

export const MenuId = {
  /** 최상위 메뉴바. 여기에는 SubmenuItem(File, Edit, ...)만 넣는다. */
  MenubarMainMenu: 'menubar',
  MenubarFileMenu: 'menubar.file',
  MenubarEditMenu: 'menubar.edit',
  MenubarViewMenu: 'menubar.view',
  MenubarTabMenu: 'menubar.tab',
  MenubarTabAlignMenu: 'menubar.tab.align',
  MenubarWindowMenu: 'menubar.window',
  MenubarHelpMenu: 'menubar.help',
} as const;
export type MenuId = (typeof MenuId)[keyof typeof MenuId];

export interface MenuCommand {
  /** CommandsRegistry에 등록된 커맨드 id. 클릭하면 이 커맨드가 실행된다. */
  readonly id: string;
  readonly title: string;
  /** 거짓이면 메뉴에 보이되 비활성화(disabled). */
  readonly precondition?: ContextKeyExpression | string;
  /** 지정하면 체크박스 항목이 되고, 참일 때 체크 표시된다. */
  readonly toggled?: ContextKeyExpression | string;
}

interface MenuEntryBase {
  /**
   * 같은 group끼리 모이고 group 사이에 구분선이 들어간다.
   * 이름 순으로 정렬하므로 VSCode처럼 `'1_align'`, `'2_close'` 식으로 앞에 숫자를 붙인다.
   */
  readonly group?: string;
  /** group 안에서의 순서. 작을수록 위. */
  readonly order?: number;
  /** 거짓이면 메뉴에서 아예 숨긴다. (비활성화는 precondition) */
  readonly when?: ContextKeyExpression | string;
}

export interface MenuItem extends MenuEntryBase {
  readonly command: MenuCommand;
}

export interface SubmenuItem extends MenuEntryBase {
  readonly submenu: MenuId;
  readonly title: string;
}

export type MenuEntry = MenuItem | SubmenuItem;

export function isSubmenuItem(entry: MenuEntry): entry is SubmenuItem {
  return (entry as SubmenuItem).submenu !== undefined;
}

class MenuRegistryImpl {
  private readonly _menus = new Map<MenuId, MenuEntry[]>();

  private readonly _onDidChangeMenu = new Emitter<MenuId>();
  /** 항목이 추가/제거되면 해당 MenuId로 발생한다. 메뉴바는 이걸 받아 다시 resolve 한다. */
  readonly onDidChangeMenu: Event<MenuId> = this._onDidChangeMenu.event;

  appendMenuItem(menuId: MenuId, entry: MenuEntry): IDisposable {
    let entries = this._menus.get(menuId);
    if (!entries) {
      entries = [];
      this._menus.set(menuId, entries);
    }
    entries.push(entry);
    this._onDidChangeMenu.fire(menuId);
    return {
      dispose: () => {
        const idx = entries.indexOf(entry);
        if (idx >= 0) {
          entries.splice(idx, 1);
          this._onDidChangeMenu.fire(menuId);
        }
      }
    };
  }

  appendMenuItems(items: Iterable<{ id: MenuId; item: MenuEntry }>): IDisposable {
    const disposables: IDisposable[] = [];
    for (const { id, item } of items) {
      disposables.push(this.appendMenuItem(id, item));
    }
    return { dispose: () => disposables.forEach(d => d.dispose()) };
  }

  getMenuItems(menuId: MenuId): readonly MenuEntry[] {
    return this._menus.get(menuId) ?? [];
  }
}

export const menuRegistry = new MenuRegistryImpl();

/** 커맨드 id -> Electron accelerator 문자열(예: `'Cmd+C'`). 보통 `keybindingService.lookupKeybindingAccelerator`. */
export type AcceleratorLookup = (commandId: string) => string | undefined;

/**
 * 등록된 메뉴를 현재 context 기준으로 평가해 직렬화 가능한 트리로 만든다.
 *
 *  - when이 거짓인 항목은 빠진다.
 *  - group 이름순 -> order -> title 순으로 정렬하고, group 사이에 separator를 넣는다.
 *  - 하위 항목이 하나도 남지 않은 서브메뉴는 빠진다.
 *  - CommandsRegistry에 핸들러가 없는 커맨드는 비활성화된다. (메뉴만 먼저 선언해 둔 경우)
 */
export function resolveMenu(menuId: MenuId, context: Context, lookupAccelerator?: AcceleratorLookup): SerializableMenuItem[] {
  const groups = new Map<string, MenuEntry[]>();
  for (const entry of menuRegistry.getMenuItems(menuId)) {
    if (!evaluate(entry.when, context, true)) {
      continue;
    }
    const group = entry.group ?? '';
    let entries = groups.get(group);
    if (!entries) {
      entries = [];
      groups.set(group, entries);
    }
    entries.push(entry);
  }

  const result: SerializableMenuItem[] = [];
  for (const group of [...groups.keys()].sort(compareGroups)) {
    const items = groups.get(group)!
      .slice()
      .sort(compareEntries)
      .map(entry => resolveEntry(entry, context, lookupAccelerator))
      .filter((item): item is SerializableMenuItem => !!item);

    if (items.length === 0) {
      continue;
    }
    if (result.length > 0) {
      result.push({ id: `${menuId}.separator.${result.length}`, type: 'separator' });
    }
    result.push(...items);
  }
  return result;
}

function resolveEntry(entry: MenuEntry, context: Context, lookupAccelerator?: AcceleratorLookup): SerializableMenuItem | undefined {
  if (isSubmenuItem(entry)) {
    const submenu = resolveMenu(entry.submenu, context, lookupAccelerator);
    if (submenu.length === 0) {
      return undefined;
    }
    return {
      id: entry.submenu,
      label: entry.title,
      type: 'submenu',
      enabled: true,
      visible: true,
      clickable: false,
      submenu,
    };
  }

  const { command } = entry;
  const toggled = command.toggled !== undefined ? evaluate(command.toggled, context, false) : undefined;
  return {
    id: command.id,
    commandId: command.id,
    label: command.title,
    type: toggled === undefined ? 'normal' : 'checkbox',
    checked: toggled,
    accelerator: lookupAccelerator?.(command.id),
    enabled: !!commandsRegistry.getCommand(command.id) && evaluate(command.precondition, context, true),
    visible: true,
    clickable: true,
  };
}

function evaluate(expr: ContextKeyExpression | string | undefined, context: Context, defaultValue: boolean): boolean {
  const resolved = typeof expr === 'string' ? ContextKeyExpr.deserialize(expr) : expr;
  return resolved ? resolved.evaluate(context) : defaultValue;
}

/** group 없는 항목은 맨 뒤. (VSCode는 'navigation' group을 맨 앞에 두지만 메뉴바에서는 쓰지 않는다) */
function compareGroups(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : 1;
}

function compareEntries(a: MenuEntry, b: MenuEntry): number {
  const orderDiff = (a.order ?? 0) - (b.order ?? 0);
  if (orderDiff !== 0) {
    return orderDiff;
  }
  return titleOf(a).localeCompare(titleOf(b));
}

function titleOf(entry: MenuEntry): string {
  return isSubmenuItem(entry) ? entry.title : entry.command.title;
}
