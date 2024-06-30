import { TreeNodeData } from "renderer/Types";

export function flatten(tree: TreeNodeData[]): TreeNodeData[] {
  let arr: any[] = [];
  Array.isArray(tree) &&
    tree.map((item) => {
      if(!item) return
      arr.push(item)
      if(Array.isArray(item.children)) {
        let a = flatten(item.children)
        arr = arr.concat(a)
      }
    });
  return arr;
}

export function getNodeById(tree: TreeNodeData[], id: string): TreeNodeData | undefined {
  return flatten(tree).find((i) => i.id === id);
}
