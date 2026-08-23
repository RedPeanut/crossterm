import { Orientation } from "./Sash";
import { SplitViewItemView, SplitViewItemSizeType, MappedSashEvent, SplitView } from "./SplitView";
import { getClientArea, $ } from "../util/dom";

/**
 * The interface to implement for views within a {@link GridView}.
 */
export interface View {
  element: HTMLElement;
}

export interface SerializableView extends View {
  toJSON(): object;
}

export interface ViewDeserializer<T extends SerializableView> {
  fromJSON(json: any): T;
}

export interface SerializedLeafNode {
  type: 'leaf';
  data: any;
  size: number;
  sizeType?: SplitViewItemSizeType;
  visible?: boolean;
  sashEnablement?: boolean;
  border?: boolean;
  minimumSize?: number;
}

export interface SerializedBranchNode {
  type: 'branch';
  data: SerializedNode[];
  size: number;
  sizeType?: SplitViewItemSizeType;
  visible?: boolean;
  sashEnablement?: boolean;
  border?: boolean;
  minimumSize?: number;
}

export type SerializedNode = SerializedLeafNode | SerializedBranchNode;

export interface SerializedGridView {
  root: SerializedNode;
  orientation: Orientation;
  width: number;
  height: number;
}

export function orthogonal(orientation: Orientation): Orientation {
  return orientation === Orientation.VERTICAL ? Orientation.HORIZONTAL : Orientation.VERTICAL;
}

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface GridLeafNode {
  view: View;
  box: Box;
  cachedVisibleSize: number | undefined;
  maximized: boolean;
}

export interface GridBranchNode {
  children: GridNode[];
  box: Box;
}

export type GridNode = GridLeafNode | GridBranchNode;

class LayoutController {}

export class BranchNode implements SplitViewItemView {
  get element(): HTMLElement { return this._element; }

  _size: number;
  get size(): number { return this._size; }
  set size(n: number) { this._size = n; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(ty: SplitViewItemSizeType) { this._sizeType = ty; }

  _minimumSize: number;
  get minimumSize(): number { return this._minimumSize; }
  set minimumSize(n: number) { this._minimumSize = n; }

  _maximumSize: number = Number.POSITIVE_INFINITY;
  get maximumSize(): number { return this._maximumSize; }
  set maximumSize(n: number) { this._maximumSize = n; }

  _border: boolean;
  get border(): boolean { return this._border; }
  set border(b: boolean) { this._border = b; }

  _sashEnablement: boolean;
  get sashEnablement(): boolean { return this._sashEnablement; }
  set sashEnablement(b: boolean) { this._sashEnablement = b; }

  layout(offset: number, size: number): void {
    // console.log(`layout() is called .., size = ${size}, orientation = ${this.orientation}`);
    // console.trace();
    this.splitView.layout(size);
  }
  onDidChange(mappedEvent: MappedSashEvent): void {}
  doWhenVisible(visible: boolean): void {}

  parent: HTMLElement;
  _element: HTMLElement;
  splitView: SplitView<SplitViewItemView>;
  _orientation: Orientation;

  get orientation(): Orientation { return this._orientation; }
  // set orientation(orientation: Orientation) { this._orientation = orientation; }

  constructor(
      orientation: Orientation,
      // size: number = 0,
      // sizeType: SplitViewItemSizeType = 'wrap_content',
      node: SerializedBranchNode,
      childDescriptors?: NodeDescriptor[]
  ) {
    this._orientation = orientation;
    this._size = node.size || 0;
    this._sizeType = node.sizeType || 'wrap_content';
    // this._visible = node.visible;
    this._sashEnablement = node.sashEnablement || false;
    this._border = node.border || false;
    this._minimumSize = node.minimumSize || 0;

    this._element = $('.grid-branch-node');
    if(!childDescriptors) {
      // Normal behavior
    } else {
      // Reconstruction behavior
      const descriptor = {
        views: childDescriptors.map(childDescriptor => {
          return {
            view: childDescriptor.node,
            size: childDescriptor.node.size,
          };
        }),
        size: node.size
      };
      this.splitView = new SplitView(this.element, { orientation, descriptor });
    }
  }
}

class LeafNode implements SplitViewItemView {
  get element(): HTMLElement { return this._view.element; }

  _size: number;
  get size(): number { return this._size; }
  set size(n: number) { this._size = n; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(ty: SplitViewItemSizeType) { this._sizeType = ty; }

  _minimumSize: number;
  get minimumSize(): number { return this._minimumSize; }
  set minimumSize(n: number) { this._minimumSize = n; }

  _maximumSize: number = Number.POSITIVE_INFINITY;
  get maximumSize(): number { return this._maximumSize; }
  set maximumSize(n: number) { this._maximumSize = n; }

  _border: boolean;
  get border(): boolean { return this._border; }
  set border(b: boolean) { this._border = b; }

  _sashEnablement: boolean;
  get sashEnablement(): boolean { return this._sashEnablement; }
  set sashEnablement(b: boolean) { this._sashEnablement = b; }

  layout(offset: number, size: number): void {}
  onDidChange(mappedEvent: MappedSashEvent): void {}
  doWhenVisible(visible: boolean): void {}

  parent: HTMLElement;
  _element: HTMLElement;
  _view: View;
  _orientation: Orientation;

  get view(): View { return this._view; }
  // set view(view: View) { this._view = view; }
  get orientation(): Orientation { return this._orientation; }
  // set orientation(orientation: Orientation) { this._orientation = orientation; }

  constructor(
    view: View,
    orientation: Orientation,
    // size: number = 0
    node: SerializedLeafNode
  ) {
    this._view = view;
    this._orientation = orientation;
    this._size = node.size || 0;
    this._sizeType = node.sizeType || 'wrap_content';
    this._sashEnablement = node.sashEnablement || false;
    this._border = node.border || false;
    this._minimumSize = node.minimumSize || 0;
  }
}

type Node = BranchNode | LeafNode;

export interface NodeDescriptor {
  node: Node;
  visible?: boolean;
}

interface GridViewOptions {}

export class GridView {

  _root: BranchNode;

  get root(): BranchNode { return this._root; }

  set root(root: BranchNode) {
    const oldRoot = this._root;
    if(oldRoot) {
      this.element.removeChild(oldRoot.element);
      // oldRoot.dispose();
      // TODO: clean event listener in here
    }
    this._root = root;
    this.element.appendChild(root.element);
  }

  element: HTMLElement;

  constructor(options: GridViewOptions) {
    this.element = $('.grid-view');
  }

  static deserialize<T extends SerializableView>(json: SerializedGridView, deserializer: ViewDeserializer<T>, options: GridViewOptions = {}): GridView {
    if (typeof json.orientation !== 'number') {
      throw new Error('Invalid JSON: \'orientation\' property must be a number.');
    } else if (typeof json.width !== 'number') {
      throw new Error('Invalid JSON: \'width\' property must be a number.');
    } else if (typeof json.height !== 'number') {
      throw new Error('Invalid JSON: \'height\' property must be a number.');
    } else if (json.root?.type !== 'branch') {
      throw new Error('Invalid JSON: \'root\' property must have \'type\' value of branch.');
    }

    const orientation = json.orientation;
    const height = json.height;

    const result = new GridView(null);
    result._deserialize(json.root as SerializedBranchNode, orientation, deserializer, height);
    return result;
  }

  _deserialize(root: SerializedBranchNode, orientation: Orientation, deserializer: ViewDeserializer<SerializableView>, size: number): void {
    this.root = this._deserializeNode(root, orientation, deserializer, size) as BranchNode;
  }

  _deserializeNode(node: SerializedNode, orientation: Orientation, deserializer: ViewDeserializer<SerializableView>, size: number): Node {
    let result: Node;
    if(node.type === 'branch') {
      const data: SerializedNode[] = node.data; // as SerializedNode[];
      const desc: NodeDescriptor[] = data.map(item => {
        return {
          node: this._deserializeNode(item, orthogonal(orientation), deserializer, node.size),
          // visible: (serializedChild as { visible?: boolean }).visible
          // visible: serializedChild?.visible // is necessary?
        } as NodeDescriptor;
      });
      result = new BranchNode(orientation,
        // node.size, node.sizeType,
        node,
        desc);
    } else {
      result = new LeafNode(deserializer.fromJSON(node.data), orientation, node);
    }
    return result;
  }

  layout(width: number, height: number, top: number = 0, left: number = 0): void {
    // console.log(`width = ${width}, height = ${height}`);
    // console.trace();
    // const [size, orthogonalSize, offset, orthogonalOffset] = this.root.orientation === Orientation.HORIZONTAL ? [height, width, top, left] : [width, height, left, top];
    const size = this.root.orientation === Orientation.HORIZONTAL ? width : height;
    // console.log('size =', size);
    this.root.layout(0, size, /* {
      orthogonalSize,
      absoluteOffset: offset,
      absoluteOrthogonalOffset: orthogonalOffset,
      absoluteSize: size,
      absoluteOrthogonalSize: orthogonalSize
    } */);
  }
}