import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../../reducers/sample';
// import styles from './style.module.scss'
import { TreeNodeData } from '../../Types';
import classnames from 'classnames';
import { DropWhereType, MultipleSelectType } from './Tree';

export type NodeUpdate = (data: Partial<TreeNodeData>) => void;

interface NodeProps {
  tree: TreeNodeData[];
  data: TreeNodeData;
  render?: (data: TreeNodeData, update: NodeUpdate) => React.ReactElement | null;
  selected_ids: string[];
  onSelect: (id: string, multiple_type?: MultipleSelectType) => void;
  collapseArrow?: string | React.ReactElement
  level: number;
  indent_px?: number;

  // mapped value
  someVal: any, onSetSomeVal: any;
}
interface NodeState {}

class Node extends React.Component<NodeProps, NodeState> {

  constructor(props: NodeProps) {
    super(props);
  }

  componentDidMount() {}

  onUpdate = (kv: Partial<TreeNodeData>) => {
  }

  render() {
    const { data, render, onSelect, selected_ids, collapseArrow, level, indent_px } = this.props;
    const is_selected = selected_ids.includes(data.id);
    const has_children = Array.isArray(data.children) && data.children.length > 0;

    return (
      <>
        <div className={classnames('node'/* , styles.node */, is_selected && 'selected')}
          onClick={(e) => {
            onSelect(data.id);
          }}
          style={{
            paddingLeft: level * (indent_px || 20) + 4,
          }}
        >
          <div className={classnames('content'/* , styles.content */)}>
            <div className={'ln_header'/* styles.ln_header */} data-role="tree-node-header">
              {
                has_children ? (
                  <div>
                    {collapseArrow ? collapseArrow : '>'}
                  </div>) : null
              }
            </div>
            <div className={'ln_body'/* styles.ln_body */} data-role="tree-node-body">
              {render ? render(data, this.onUpdate) : data.title || `node#${data.id}`}
            </div>
          </div>
        </div>
        {
          has_children && data.children && !data.is_collapsed
          ? data.children.map((node) => (
              <Node {...this.props} key={node.id} data={node} level={level+1} />
            ))
          : null}
      </>
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

export default connect(mapStateToProps, mapDispatchToProps)(Node);
