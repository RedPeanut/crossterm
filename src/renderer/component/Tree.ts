import { $, append } from "../util/dom";
import { ListItemElem } from "./List";
import { Node } from './Node';

/* export interface TreeNodeData {
  id: string;
  children?: TreeNodeData[];
  [key: string]: any;

  title?: string;
  canSelect?: boolean; // 선택 가능 여부, 기본값은 true
  canDrag?: boolean; // 드래그 가능 여부, 기본값은 true
  canDropBefore?: boolean; // 이전 드롭이 허용되는지 여부, 기본값은 true
  canDropIn?: boolean; // 드롭인 허용 여부, 기본값은 true
  canDropAfter?: boolean; // 이후 드롭을 허용할지 여부, 기본값은 true
  isCollapsed?: boolean;
} */

export class Tree {
  container: HTMLElement;
  element: HTMLElement;
  // tree: ListItemElem[];
  onSelect: (id: string[]) => void;
  onDoubleClick: (id: string) => void;
  nodes: Node[];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  onSelect_(id: string): void {
    const onSelect = this.onSelect;
    let new_selected_ids: string[] = [];
    new_selected_ids = [id];
    onSelect && onSelect(new_selected_ids);
  }

  onDoubleClick_(id: string): void {
    // console.log('onDoubleClick_() is called...');
    this.onDoubleClick && this.onDoubleClick(id);
  }

  create(tree: ListItemElem[],
    selectedIds: string[],
    onChange: Function,
    onSelect: (id: string[]) => void,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
    onDoubleClick: (id: string) => void
  ): void {
    // this.tree = tree;
    this.onSelect = onSelect;
    this.onDoubleClick = onDoubleClick;

    this.element = $('.tree');
    this.nodes = [];
    tree.map((e) => {
      const node = new Node(this.element);
      node.create(e, 0, nodeRender, this.onSelect_.bind(this), this.onDoubleClick_.bind(this), selectedIds);
      this.nodes.push(node);
    });
    append(this.container, this.element);
  }
}