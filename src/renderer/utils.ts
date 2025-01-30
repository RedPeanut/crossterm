import { TerminalItem } from "../common/Types";
import { Group, isSplitItem, SplitItem } from "./Types";

export function findActiveItem(curr: SplitItem, depth: number, index: number[])
: { depth: number, index: number[], pos: number, item: TerminalItem, group: TerminalItem[], splitItem: SplitItem } | undefined {
  if(curr.list && curr.list.length > 0) {
    for(let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      // let _index = index.concat(i);
      if(isSplitItem(item)) {
        let retVal = findActiveItem(item as SplitItem, depth+1, index.concat(i));
        if(retVal) return retVal;
      } else {
        item = item as TerminalItem[];
        for(let j = 0; j < item.length; j++) {
          let _item = item[j];
          if(_item.active) {
            return { depth, index: index.concat(i), pos: j, item: _item, group: item, splitItem: curr }
          }
        }
      }
    }
  }
  return undefined;
}

export function findItemById(curr: SplitItem, depth: number, index: number[], id: string)
: { depth: number, index: number[], pos: number, item: TerminalItem, group: TerminalItem[], splitItem: SplitItem } | undefined {
  if(curr.list && curr.list.length > 0) {
    for(let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      // let _index = index.concat(i);
      if(isSplitItem(item)) {
        let retVal = findItemById(item as SplitItem, depth+1, index.concat(i), id);
        if(retVal) return retVal;
      } else {
        item = item as TerminalItem[];
        for(let j = 0; j < item.length; j++) {
          let _item = item[j];
          if(_item.uid === id) {
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
  if(curr.list && curr.list.length > 0) {
    for(let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      if(isSplitItem(item)) {
        let retVal = findSplitItemByGroup(item as SplitItem, depth+1, index.concat(i), group);
        if(retVal) return retVal;
      } else {
        item = item as Group;
        if(item === group)
          return { depth, index: index.concat(i), group: item, splitItem: curr }
      }
    }
  }
  return undefined;
}

export function cleanSingleSplitItemOnce(curr: SplitItem): void {
  if(curr.list && curr.list.length > 0) {
    for(let i = 0; i < curr.list.length; i++) {
      let item = curr.list[i];
      if(isSplitItem(item)) {
        const _item = item as SplitItem;
        if(_item.list.length === 1) {
          curr.list[i] = _item.list[0];
        } else {
          cleanSingleSplitItemOnce(_item);
        }
      } else {
        item = item as Group;
      }
    }
  }
}
