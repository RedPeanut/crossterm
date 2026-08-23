import { Orientation } from "./Sash";
import { GridView, View as GridViewView } from "./GridView";
import { SplitViewItemSizeType } from "./SplitView";

export interface View extends GridViewView {}

export class Grid<T extends View = View> {
  gridView: GridView;
  views = new Map<T, HTMLElement>();

  get element(): HTMLElement { return this.gridView.element; }

  constructor(view: T | GridView) {
    if(view instanceof GridView) {
      this.gridView = view;
      // this.gridView.getViewMap(this.views);
    }
  }

  layout(width: number, height: number, top: number = 0, left: number = 0): void {
		this.gridView.layout(width, height, top, left);
		// this.didLayout = true;
	}
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
  sizeType?: SplitViewItemSizeType; // = 'wrap_content';
  visible?: boolean;
  sashEnablement?: boolean;
  border?: boolean;
  minimumSize?: number;
}

export type SerializedNode = SerializedLeafNode | SerializedBranchNode;

export interface SerializedGrid {
  root: SerializedNode;
  orientation: Orientation;
  width: number;
  height: number;
}

/**
 * A {@link Grid} which can serialize itself.
 */
export class SerializableGrid<T extends SerializableView> extends Grid<T> {

  static deserialize<T extends SerializableView>(json: SerializedGrid , deserializer: ViewDeserializer<T>): SerializableGrid<T> {
    if (typeof json.orientation !== 'number') {
      throw new Error('Invalid JSON: \'orientation\' property must be a number.');
    } else if (typeof json.width !== 'number') {
      throw new Error('Invalid JSON: \'width\' property must be a number.');
    } else if (typeof json.height !== 'number') {
      throw new Error('Invalid JSON: \'height\' property must be a number.');
    }

    console.log('{ ...json } =', { ...json });
    const gridView = GridView.deserialize(json, deserializer);
    const result = new SerializableGrid<T>(gridView);

    return result;
  }

  override layout(width: number, height: number, top: number = 0, left: number = 0): void {
    super.layout(width, height, top, left);
  }
}
