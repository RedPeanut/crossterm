import assert from 'assert';
import { ContextKeyService } from '../service/ContextKeyService';
import { MenuId, menuRegistry, resolveMenu } from './MenuRegistry';

describe('#MenuRegistry', function () {

  it('sorts by group then order, and puts separators between groups', function () {
    const disposable = menuRegistry.appendMenuItems([
      { id: MenuId.MenubarTabMenu, item: { command: { id: 'tab.close', title: 'Close' }, group: '2_close' } },
      { id: MenuId.MenubarTabMenu, item: { command: { id: 'tab.b', title: 'B' }, group: '1_align', order: 2 } },
      { id: MenuId.MenubarTabMenu, item: { command: { id: 'tab.a', title: 'A' }, group: '1_align', order: 1 } },
    ]);
    const context = new ContextKeyService().getContext();

    assert.deepStrictEqual(
      resolveMenu(MenuId.MenubarTabMenu, context).map(item => item.type === 'separator' ? '---' : item.label),
      ['A', 'B', '---', 'Close']
    );
    disposable.dispose();
  });

  it('hides by when, disables by precondition, checks by toggled', function () {
    const disposable = menuRegistry.appendMenuItems([
      { id: MenuId.MenubarEditMenu, item: { command: { id: 'edit.hidden', title: 'Hidden' }, when: 'terminalFocused' } },
      { id: MenuId.MenubarEditMenu, item: { command: { id: 'edit.copy', title: 'Copy', precondition: 'terminalHasSelection' } } },
      { id: MenuId.MenubarEditMenu, item: { command: { id: 'tab.broadcast', title: 'Broadcast', toggled: 'broadcastVisible' } } },
    ]);
    const contextKeyService = new ContextKeyService();
    const terminalFocused = contextKeyService.createKey<boolean>('terminalFocused', false);
    contextKeyService.createKey<boolean>('broadcastVisible', true);
    const accelerators: Record<string, string> = { 'edit.copy': 'Cmd+C' };

    const pick = () => resolveMenu(MenuId.MenubarEditMenu, contextKeyService.getContext(), id => accelerators[id])
      .map(({ id, enabled, checked, accelerator }) => ({ id, enabled, checked, accelerator }));

    assert.deepStrictEqual(pick(), [
      { id: 'tab.broadcast', enabled: true, checked: true, accelerator: undefined },
      { id: 'edit.copy', enabled: false, checked: undefined, accelerator: 'Cmd+C' },
    ]);

    terminalFocused.set(true);
    assert.deepStrictEqual(pick().map(item => item.id), ['tab.broadcast', 'edit.copy', 'edit.hidden']);
    disposable.dispose();
  });

  it('resolves submenus recursively and drops empty ones', function () {
    const disposable = menuRegistry.appendMenuItems([
      { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarTabMenu, title: 'Tab', order: 1 } },
      { id: MenuId.MenubarMainMenu, item: { submenu: MenuId.MenubarHelpMenu, title: 'Help', order: 2 } },
      { id: MenuId.MenubarTabMenu, item: { command: { id: 'tab.a', title: 'A' } } },
    ]);
    const context = new ContextKeyService().getContext();

    assert.deepStrictEqual(resolveMenu(MenuId.MenubarMainMenu, context), [
      {
        id: MenuId.MenubarTabMenu, label: 'Tab', type: 'submenu', enabled: true, visible: true, clickable: false,
        submenu: [
          { id: 'tab.a', commandId: 'tab.a', label: 'A', type: 'normal', checked: undefined, accelerator: undefined, enabled: true, visible: true, clickable: true },
        ],
      },
    ]);
    disposable.dispose();
  });
});
