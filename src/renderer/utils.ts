import { Children, ListItemElem, TerminalItem } from "../common/Types";
import { Group, isSplitItem, SplitItem } from "./Types";

export function findActiveItem(curr: SplitItem, depth: number, index: number[])
: { depth: number, index: number[], pos: number, item: TerminalItem, group: Group, splitItem: SplitItem } | undefined {
  if (curr.list && curr.list.length > 0) {
    for (let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      // let _index = index.concat(i);
      if (isSplitItem(item)) {
        let retVal = findActiveItem(item as SplitItem, depth+1, index.concat(i));
        if (retVal) return retVal;
      } else {
        item = item as Group;
        for (let j = 0; j < item.length; j++) {
          let _item = item[j];
          if (_item.active) {
            return { depth, index: index.concat(i), pos: j, item: _item, group: item, splitItem: curr }
          }
        }
      }
    }
  }
  return undefined;
}

export function findItemById(curr: SplitItem, depth: number, index: number[], id: string)
: { depth: number, index: number[], pos: number, item: TerminalItem, group: Group, splitItem: SplitItem } | undefined {
  if (curr.list && curr.list.length > 0) {
    for (let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      // let _index = index.concat(i);
      if (isSplitItem(item)) {
        let retVal = findItemById(item as SplitItem, depth+1, index.concat(i), id);
        if (retVal) return retVal;
      } else {
        item = item as Group;
        for (let j = 0; j < item.length; j++) {
          let _item = item[j];
          if (_item.uid === id) {
            return { depth, index: index.concat(i), pos: j, item: _item, group: item, splitItem: curr }
          }
        }
      }
    }
  }
  return undefined;
}

export function findSplitItemByGroup(curr: SplitItem, depth: number, index: number[], group: Group)
: { depth: number, index: number[], group: Group, splitItem: SplitItem } | undefined {
  if (curr.list && curr.list.length > 0) {
    for (let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      if (isSplitItem(item)) {
        let retVal = findSplitItemByGroup(item as SplitItem, depth+1, index.concat(i), group);
        if (retVal) return retVal;
      } else {
        item = item as Group;
        if (item === group)
          return { depth, index: index.concat(i), group: item, splitItem: curr }
      }
    }
  }
  return undefined;
}

/* export function cleanSingleSplitItemOnce(curr: SplitItem): void {
  if (curr.list && curr.list.length > 0) {
    for (let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      if (isSplitItem(item)) {
        const _item = item as SplitItem;
        if (_item.list.length === 1) {
          curr.list[i] = _item.list[0];
        } else {
          cleanSingleSplitItemOnce(_item);
        }
      } else {
        item = item as Group;
      }
    }
  }
} */

export function flatten<T extends Children<T>>(list: T[]): T[] {
  let new_list: T[] = [];
  list.map((item) => {
    new_list.push(item);
    if (item.children
      && item.isCollapsed === false) {
      new_list = [ ...new_list, ...flatten(item.children) ];
    }
  });
  return new_list;
}

export const TREE_STATE_SEPARATOR = '::';

/**
 * treeViewState.expanded 의 경로 키를 items 트리의 isCollapsed 로 반영한다.
 * 키는 루트부터의 name 을 '::' 로 이은 상대경로 (ex. 'r3::c32::cc321').
 * id 는 매 기동마다 uuid 로 새로 발급되므로 이름 경로를 키로 사용한다.
 */
export function applyTreeViewState(items: ListItemElem[], expanded: string[]): void {
  const expandedSet = new Set(expanded);

  const walk = (list: ListItemElem[], parentPath: string): void => {
    list.map((item) => {
      if (!item.children) return;

      const path = parentPath ? parentPath + TREE_STATE_SEPARATOR + item.name : item.name;
      item.isCollapsed = !expandedSet.has(path);
      walk(item.children, path);
    });
  };

  walk(items, '');
}

/**
 * items 트리에서 펼쳐진 노드의 경로 키를 모은다. applyTreeViewState 의 역함수.
 * 접힌 부모 아래도 훑어서 자식의 펼침 상태를 보존한다. (flatten 은 접힌 가지를 건너뛰므로 쓰지 않는다)
 */
export function collectExpandedPaths(items: ListItemElem[]): string[] {
  const expanded: string[] = [];

  const walk = (list: ListItemElem[], parentPath: string): void => {
    list.map((item) => {
      if (!item.children) return;

      const path = parentPath ? parentPath + TREE_STATE_SEPARATOR + item.name : item.name;
      if (item.isCollapsed === false) expanded.push(path);
      walk(item.children, path);
    });
  };

  walk(items, '');
  return expanded;
}
