import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../../reducers/sample';
import Node, { NodeUpdate } from './Node';
import classnames from 'classnames';
import styles from './style.module.scss'
import { TreeNodeData } from '../../Types';

export type DropWhereType = 'before' | 'in' | 'after';
export type MultipleSelectType = 0 | 1 | 2;

interface TreeProps {
  data: TreeNodeData[];
  nodeRender?: (node: TreeNodeData, update: NodeUpdate) => React.ReactElement | null;
  nodeAttr?: (node: TreeNodeData) => Partial<TreeNodeData>;
  onChange?: (tree: TreeNodeData[]) => void;
  onSelect?: (ids: string[]) => void
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
  someVal: any;
  onSetSomeVal: any;
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

  onSelectOne(id: string, multiple_type: MultipleSelectType = 0): void {
    const { onSelect } = this.props;
    let new_selected_ids: string[] = [];

    if(multiple_type === 0) {
      new_selected_ids = [id];
    } else if(multiple_type === 1) {
      // // 按住 cmd/ctrl 多选 (여러 개를 선택하려면 cmd/ctrl을 누르세요)
      // if(!canBeSelected(tree, selected_ids, id)) {
      //   return;
      // }
      // if(selected_ids.includes(id)) {
      //   new_selected_ids = selected_ids.filter((i) => i !== id);
      // } else {
      //   new_selected_ids = [...selected_ids, id];
      // }
    } else if(multiple_type === 2) {
      // // 按住 shift 多选 (여러 개를 선택하려면 Shift 키를 누른 채 선택하세요)
      // new_selected_ids = selectTo(tree, selected_ids, id);
    }

    // setSelectedIds(new_selected_ids);
    onSelect && onSelect(new_selected_ids);
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
                // onDragStart={onDragStart}
                // onDragEnd={onDragEnd}
                selected_ids={selected_ids}
                onSelect={this.onSelectOne}
              />
            )
          })
        }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    someVal: state.sample.someVal,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetSomeVal: (v: any) => dispatch(setSomeVal(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tree);
