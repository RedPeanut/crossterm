import { TerminalItem } from "../common/Types";
import { isSplitItem, SplitItem } from "./Types";

export function findActiveItem(curr: SplitItem, depth: number, index: number[])
: { depth: number, index: number[], pos: number, item: TerminalItem, group: TerminalItem[], splitItem: SplitItem } | undefined {
  if(curr.list.length > 0) {
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
  if(curr.list.length > 0) {
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