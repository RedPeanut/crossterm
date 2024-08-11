import { TerminalItem } from "common/Types";
import { FlatItem, ListItem, SplitItem, isSplitItem, isSplitItem_ } from "./Types";

export const flatten = (list: ListItem[]): ListItem[] => {
  let new_list: ListItem[] = [];
  list.map((item) => {
    new_list.push(item);
    if(item.children) {
      new_list = [...new_list, ...flatten(item.children)];
    }
  });
  return new_list;
}

export function findActiveItem(curr: SplitItem, depth: number, index: number[]): { depth: number, index: number[], pos: number, item: TerminalItem, group: TerminalItem[], splitItem: SplitItem } | undefined {
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

export function findItemById(curr: SplitItem, depth: number, index: number[], id: string): { depth: number, index: number[], pos: number, item: TerminalItem, group: TerminalItem[], splitItem: SplitItem } | undefined {
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

/* export function getActiveItemindex(list: FlatItem[]): {} {
  let i = 0, j = 0; // active item index
  outer: for(i = 0; i < list.length; i++) {
    if(!isSplitItem_(list[i])) {
      if(list[i].children) {
        for(j = 0; j < list[i].children!.length; j++) {
          if(list[i].children![j].active) {
            break outer;
          }
        }
      }
    }
  }

  // i and j are selected after loop
  i = i > list.length-1 ? list.length-1 : i;
  if(list[i].children)
    j = j > list[i].children!.length-1 ? list[i].children!.length-1 : j;
  return { i, j };
}

export function getItemindex(list: FlatItem[], item: FlatItem): {} {
  let i = 0, j = 0; // active item index
  outer: for(i = 0; i < list.length; i++) {
    if(!isSplitItem_(list[i])) {
      if(list[i].children) {
        for(j = 0; j < list[i].children!.length; j++) {
          if(list[i].children![j].id === item.id) {
            break outer;
          }
        }
      }
    }
  }

  // i and j are selected after loop
  i = i > list.length-1 ? list.length-1 : i;
  if(list[i].children)
    j = j > list[i].children!.length-1 ? list[i].children!.length-1 : j;
  return { i, j };
} */

/**
 * 복잡한가?
 * @param list
 * @param cb
 * @returns
 */
export function getItemIndex(list: FlatItem[], cb: (item: FlatItem) => boolean): { i: number, j: number } {
  let i = 0, j = 0; // active item index
  outer: for(i = 0; i < list.length; i++) {
    if(!isSplitItem_(list[i])) {
      if(list[i].children) {
        for(j = 0; j < list[i].children!.length; j++) {
          if(cb(list[i].children![j])) {
            break outer;
          }
        }
      }
    }
  }

  // i and j are selected after loop
  i = i > list.length-1 ? list.length-1 : i;
  if(list[i].children)
    j = j > list[i].children!.length-1 ? list[i].children!.length-1 : j;
  return { i, j };
}
