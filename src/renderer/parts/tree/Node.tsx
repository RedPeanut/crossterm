import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
// import styles from './style.module.scss'
import { TreeNodeData } from 'renderer/Types';
import { DropWhereType, MultipleSelectType } from 'renderer/parts/tree/Tree';

declare global {
  interface Window {
    _t_dragover_id?: string
    _t_dragover_ts: number
  }
};

export type NodeUpdate = (data: Partial<TreeNodeData>) => void;

interface NodeProps {
  tree: TreeNodeData[];
  data: TreeNodeData;

  //
  render?: (data: TreeNodeData, update: NodeUpdate) => React.ReactElement | null;
  selected_ids: string[];
  onSelect: (id: string, multiple_type?: MultipleSelectType) => void;
  onDoubleClick: (id: string) => void;
  collapseArrow?: string | React.ReactElement;
  level: number;
  indent_px?: number;
  onChange: (id: string, data: Partial<TreeNodeData>) => void;

  // drag
  nodeAttr?: (node: TreeNodeData) => Partial<TreeNodeData>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  setDropTargetId: (id: string | null) => void;
  setDropWhere: (where: DropWhereType | null) => void;
  is_dragging: boolean;
  drag_source_id: string | null;
  drop_target_id: string | null;
  drag_target_where: DropWhereType | null;

  // mapped value
  // ...
}
interface NodeState {}

class Node extends React.Component<NodeProps, NodeState> {

  el_node: HTMLDivElement | null = null;
  el_dragging: HTMLDivElement | null = null;

  constructor(props: NodeProps) {
    super(props);
  }

  componentDidMount() {}

  onUpdate = (kv: Partial<TreeNodeData>) => {
  }

  onDragStart = (e: React.DragEvent) => {
    let ne = e.nativeEvent;
    if(ne.dataTransfer) {
      // ne.dataTransfer.dropEffect = 'move';
      // ne.dataTransfer.effectAllowed = 'move';
    }
    this.props.onDragStart(this.props.data.id);
  }

  onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      data,
      nodeAttr
    } = this.props;
    const attr = nodeAttr ? nodeAttr(data) : data;

    if(!this.props.is_dragging || !this.props.drag_source_id) return;
    // console.log('>>> 1');

    let el_target = e.target as HTMLElement;
    if(!el_target) return;

    if(data.id === this.props.drag_source_id) return;
    // if(isChildOf(props.tree, data.id, drag_source_id)) return;
    // console.log('>>> 2');

    // console.log('data.id =', data.id);
    this.props.setDropTargetId(data.id);

    let now = new Date().getTime();
    if(window._t_dragover_id !== data.id) {
      window._t_dragover_id = data.id;
      window._t_dragover_ts = now;
    }
    if(data.children?.length && data.is_collapsed && now - window._t_dragover_ts > 1000) {
      this.props.onChange(data.id, { is_collapsed: false });
    }
    // console.log('>>> 3');

    // where
    let ne = e.nativeEvent;
    let h = el_target.offsetHeight;
    let y = ne.offsetY;
    let where: DropWhereType | null = null;
    let h_2 = h >> 1;
    let h_4 = h >> 2;
    let h_threshold = attr.can_drop_in === false ? h_2 : h_4;
    if(y <= h_threshold) {
      if(attr.can_drop_before === false) {
        this.props.setDropWhere(null);
        return;
      }
      where = 'before';
    } else if(y >= h - h_threshold) {
      if(attr.can_drop_after === false) {
        this.props.setDropWhere(null);
        return;
      }
      where = 'after';
    } else {
      if(attr.can_drop_in === false) {
        this.props.setDropWhere(null);
        return;
      }
      where = 'in';
    }
    this.props.setDropWhere(where);
    // console.log('>>> 4');
  }

  onDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onDragEnd();
    window._t_dragover_id = '';
    // el_dragging.current && (el_dragging.current.style.display = 'none');
  }

  render() {
    const {
      data, nodeAttr,
      is_dragging, drag_target_where, drag_source_id, drop_target_id,
      render, onSelect, onDoubleClick, selected_ids, collapseArrow, level, indent_px,
      onChange,
    } = this.props;

    const is_selected = selected_ids.includes(data.id);
    const has_children = Array.isArray(data.children) && data.children.length > 0;
    const attr = nodeAttr ? nodeAttr(data) : data;
    const is_drag_source = drag_source_id === data.id;
    const is_drop_target = drop_target_id === data.id;
    
    return (
      <>
        <div
          ref={ref => this.el_node = ref}
          className={classnames('node'/* , styles.node */,
            is_selected && 'selected',
            is_dragging && 'is_dragging',
            is_drop_target && drag_target_where === 'before' && 'drop_before',
            is_drop_target && drag_target_where === 'after' && 'drop_after',
          )}
          style={{
            paddingLeft: level * (indent_px || 20) + 4,
          }}
          onClick={(e) => {
            onSelect(data.id);
          }}
          onDoubleClick={(e) => {onDoubleClick(data.id);}}

          //
          draggable={attr.can_drag !== false}
          onDragStart={this.onDragStart}
          // onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          // onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onDrop={this.onDragEnd}
        >
          <div className={classnames('content'/* , styles.content */)}>
            <div className={'ln_header'/* styles.ln_header */} data-role="tree-node-header">
              {
                has_children ? (
                  <div className={classnames('arrow', data.is_collapsed && 'collapsed')}
                    onClick={() => {
                      onChange(data.id, { is_collapsed: !data.is_collapsed });
                    }}
                  >
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
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Node);
