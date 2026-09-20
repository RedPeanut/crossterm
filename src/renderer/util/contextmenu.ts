// import { MenuEvent, MenuItem, PopupOptions, SerializableMenuItem } from "../Types";
import { ContextMenuEvent, ContextMenuItem, PopupOptions, SerializableContextMenuItem } from "../../common/Types";

let contextMenuIdPool = 0;

export function popup(items: ContextMenuItem[], options?: PopupOptions, onHide?: () => void): void {
  const processedItems: ContextMenuItem[] = [];

  const contextMenuId = contextMenuIdPool++;
  const onClickChannel = `contextmenu on ${contextMenuId}`;
  const onClickChannelHandler = (event: unknown, itemId: number, context: ContextMenuEvent) => {
    console.log('once channelHandler is called ..');
    // console.log('itemId =', itemId);
    // console.log('context =', context);

    const item = processedItems[itemId];
    item.click?.([event, itemId, context]);
  };
  const disposeClick = window.ipc.once(onClickChannel, onClickChannelHandler);

  const disposeClose = window.ipc.once('contextmenu close', (event: unknown, closedContextMenuId: number) => {
    console.log('once contextmenu close is called ..');
    // console.log('closedContextMenuId =', closedContextMenuId);

    if (closedContextMenuId !== contextMenuId)
      return;

    // window.ipc.off(onClickChannel, onClickChannelHandler);
    disposeClose.dispose();
    disposeClick.dispose();
    onHide?.();
  });

  // const serializableItems: SerializableContextMenuItem[] = items.map(item => createItem(item, processedItems));
  window.ipc.send('contextmenu', contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
}

function createItem(item: ContextMenuItem, processedItems: ContextMenuItem[]): SerializableContextMenuItem {
  const serializableItem: SerializableContextMenuItem = {
    id: processedItems.length,
    label: item.label,
    type: item.type,
    accelerator: item.accelerator,
    enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    visible: typeof item.visible === 'boolean' ? item.visible : true,
    checked: item.checked,
  };

  processedItems.push(item);

  // Submenu
  if (Array.isArray(item.submenu)) {
    serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem, processedItems));
  }

  return serializableItem;
}