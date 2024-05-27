import { FlatItem, isSplitItem_ } from "./Types";

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
