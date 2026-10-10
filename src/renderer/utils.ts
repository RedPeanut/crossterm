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

/**
 * 화면에 보이는 터미널들. Group마다 selected 하나만 표시되므로 그것들만 모은다.
 * (findActiveItem/findItemById는 첫 매치에서 멈추는 단일 타겟 탐색이라 재사용할 수 없다)
 *
 * 방송 대상 스냅샷을 만들 때 쓴다. 스냅샷 이후로는 아무도 이 함수를 다시 부르지 않으므로,
 * 나중에 생긴 터미널이 방송 집합에 저절로 끼어들 경로가 없다.
 */
export function collectVisibleItems(curr: SplitItem): TerminalItem[] {
  const result: TerminalItem[] = [];

  const walk = (node: SplitItem): void => {
    if (!node.list || node.list.length === 0) return;
    for (const entry of node.list) {
      if (isSplitItem(entry)) {
        walk(entry as SplitItem);
      } else {
        const selected = (entry as Group).find((item) => item.selected);
        if (selected) result.push(selected);
      }
    }
  };

  walk(curr);
  return result;
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

/**
 * 트리에 있는 모든 터미널. collectVisibleItems와 달리 탭 뒤에 숨은 것까지 트리 순서대로 모은다.
 *
 * 탭 정렬(Align)처럼 트리를 통째로 다시 짤 때 쓴다.
 */
export function collectAllItems(curr: SplitItem): TerminalItem[] {
  const result: TerminalItem[] = [];

  const walk = (node: SplitItem): void => {
    if (!node.list || node.list.length === 0) return;
    for (const entry of node.list) {
      if (isSplitItem(entry)) {
        walk(entry as SplitItem);
      } else {
        result.push(...(entry as Group));
      }
    }
  };

  walk(curr);
  return result;
}

/**
 * Tiles 정렬의 행별 터미널 개수. (ex. 7 -> [3, 4])
 *
 * 행 수 r은 열 수 ceil(n/r) 대비 비율이 와이드(1.5)에 가장 가까운 값으로 고르고, 동률이면 행이 적은 쪽을 택한다.
 * 나누어 떨어지지 않으면 남는 칸은 아래쪽 행부터 하나씩 더 받는다. (ex. 3 -> [1, 2], 5 -> [2, 3])
 *
 * Note. getGridDimensions는 7을 3x3(마지막 행 1개)으로 잡으므로 이 용도에는 맞지 않는다.
 */
export function getTileRows(n: number): number[] {
  if (n <= 0) return [];

  let bestRows = 1;
  let minDiff = Infinity;
  for (let r = 1; r <= n; r++) {
    const c = Math.ceil(n / r);
    const diff = Math.abs(c / r - 1.5);
    // if (diff < minDiff) {
    if (diff < minDiff
      || (diff === minDiff && n % r === 0 && n % bestRows !== 0)
    ) {
      minDiff = diff;
      bestRows = r;
    }
  }

  const base = Math.floor(n / bestRows);
  const extra = n % bestRows;
  return Array.from({ length: bestRows }, (_, i) => base + (i >= bestRows - extra ? 1 : 0));
}
