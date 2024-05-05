import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../../reducers/sample';
import styles from './style.module.scss'
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
    const { data, render, onSelect, selected_ids } = this.props;
    const is_selected = selected_ids.includes(data.id);

    return (
      <div className={classnames('node'/* , styles.node */, is_selected && 'selected')}>
        <div className={classnames('content'/* , styles.content */)}>
          <div className={'ln_header'/* styles.ln_header */} data-role="tree-node-header">

          </div>
          <div className={'ln_body'/* styles.ln_body */} data-role="tree-node-body">
            {render ? render(data, this.onUpdate) : data.title || `node#${data.id}`}
          </div>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Node);
