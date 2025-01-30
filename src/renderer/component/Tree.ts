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
  tree: ListItemElem[];
  onDoubleClick: (id: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  onDoubleClick_(id: string): void {
    console.log('onDoubleClick_() is called...');
    this.onDoubleClick && this.onDoubleClick(id);
  }

  create(tree: ListItemElem[],
    selectedIds: string[],
    onChange: Function,
    onSelect: Function,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
    onDoubleClick: (id: string) => void
  ): void {
    this.tree = tree;
    this.onDoubleClick = onDoubleClick;

    this.element = $('.tree');
    this.tree.map((e) => {
      const node = new Node(this.element);
      node.create(e, 0, nodeRender, this.onDoubleClick_.bind(this));
    });
    append(this.container, this.element);
  }
}