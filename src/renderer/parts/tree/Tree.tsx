import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { TreeNodeData } from 'renderer/Types';
import { getNodeById } from 'renderer/parts/tree/fn';
import Node, { NodeUpdate } from 'renderer/parts/tree/Node';

export type DropWhereType = 'before' | 'in' | 'after';
export type MultipleSelectType = 0 | 1 | 2;

interface TreeProps {
  data: TreeNodeData[];
  nodeRender?: (node: TreeNodeData, update: NodeUpdate) => React.ReactElement | null;
  nodeAttr?: (node: TreeNodeData) => Partial<TreeNodeData>;
  onChange?: (tree: TreeNodeData[]) => void;
  onSelect?: (ids: string[]) => void;
  onDoubleClick?: (id: string) => void;
  collapseArrow?: string | React.ReactElement;
  draggingNodeRender?: (node: TreeNodeData, source_ids: string[]) => React.ReactElement;
  nodeClassName?: string;
  nodeSelectedClassName?: string;
  nodeDropInClassName?: string;
  nodeCollapseArrowClassName?: string;
  allowed_multiple_selection?: boolean;
  className?: string;
  selected_ids: string[];

  // mapped value
  // someVal: any;
  // onSetSomeVal: any;
}
interface TreeState {
  // tree: TreeNodeData[];
  is_dragging: boolean;
  drag_source_id: string;
  drop_target_id: string;
  selected_ids: string[];
  drop_where: DropWhereType;
}

class Tree extends React.Component<TreeProps, TreeState> {

  constructor(props: TreeProps) {
    super(props);
  }

  componentDidMount() {}

  onSelect_(id: string, multiple_type: MultipleSelectType = 0): void {
    const { onSelect } = this.props;
    let new_selected_ids: string[] = [];

    if(multiple_type === 0) {
      new_selected_ids = [id];
    } else if(multiple_type === 1) {
      // // 여러 개를 선택하려면 cmd/ctrl을 누르세요
      // if(!canBeSelected(tree, selected_ids, id)) {
      //   return;
      // }
      // if(selected_ids.includes(id)) {
      //   new_selected_ids = selected_ids.filter((i) => i !== id);
      // } else {
      //   new_selected_ids = [...selected_ids, id];
      // }
    } else if(multiple_type === 2) {
      // // 여러 개를 선택하려면 Shift 키를 누른 채 선택하세요
      // new_selected_ids = selectTo(tree, selected_ids, id);
    }

    // setSelectedIds(new_selected_ids);
    onSelect && onSelect(new_selected_ids);
  }

  onDoubleClick_(id: string): void {
    console.log('onDoubleClick_() is called...');
    const { onDoubleClick } = this.props;
    onDoubleClick && onDoubleClick(id);
  }

  onTreeChange(tree: TreeNodeData[]): void {
    this.props.onChange && this.props.onChange(tree);
  }

  onNodeChange(id: string, data: Partial<TreeNodeData>) {
    let _tree = _.cloneDeep(this.props.data);
    let node = getNodeById(_tree, id);
    if(!node) return;

    Object.assign(node, data);
    this.onTreeChange(_tree);
  }

  render() {
    const tree: TreeNodeData[] = this.props.data;
    const { /* data as tree,  */className, selected_ids } = this.props;
    // this.state.selected_ids = this.props.selected_ids || [];

    return (
      <div className={classnames('tree', className)} /* onDrop={onDragEnd} */>
        {
          tree.map((node) => {
            return (
              <Node
                key={node.id}
                tree={tree}
                data={node}
                render={this.props.nodeRender}
                collapseArrow={this.props.collapseArrow}
                selected_ids={selected_ids}
                onSelect={this.onSelect_.bind(this)}
                onDoubleClick={this.onDoubleClick_.bind(this)}
                onChange={this.onNodeChange.bind(this)}
                level={0}
              />
            )
          })
        }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Tree);
