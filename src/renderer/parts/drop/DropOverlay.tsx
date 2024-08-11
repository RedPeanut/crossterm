import React, {  } from 'react';
import { connect } from 'react-redux';
import _, { DebouncedFunc } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { setDropOverlay, setTree } from 'renderer/reducers/app';
import { findActiveItem, findItemById } from 'renderer/util';
import { TerminalItem } from 'common/Types';
import { Mode, SplitItem } from 'renderer/Types';
import update, { Spec } from 'immutability-helper';
const debug = require('debug')('DropOverlay');

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

interface DropOverlayProps {
  groupId: string;
  terms_uid: string;
  // list: Terminal_[];
  // pid: string;
  // children?: FlatItem[];
  group: TerminalItem[];

  // mapped values
  dropOverlay: any; onSetDropOverlay: any;
  tree: any; onSetTree: any;
  // list: any; onSetList: any;
}

interface DropOverlayState {}

class DropOverlay extends React.Component<DropOverlayProps, DropOverlayState> {

  // ref: React.MutableRefObject<HTMLDivElement | undefined>;
  ref: any;
  clientWidth: number;
  clientHeight: number;
  showDropTarget!: boolean;
  splitDirection: GroupDirection | undefined;
  throttle_doPositionOverlay: DebouncedFunc<(...args: any[]) => any>;

  constructor(props: DropOverlayProps) {
    super(props);
    // this.ref = useRef();
    this.clientWidth = -1;
    this.clientHeight = -1;
    this.splitDirection = undefined;

    this.state = {};
    this.throttle_doPositionOverlay = _.throttle(this.doPositionOverlay.bind(this), 300, {trailing:false});
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return false;
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    // if(this.ref && this.ref.current) {
    //   const rect = this.ref.current.getBoundingClientRect();
    //   // You can now use rect to position other elements or for any other purpose
    //   console.log('rect =', rect);
    // }
  }

  componentDidMount() {
    this.clientWidth = this.ref.clientWidth;
    this.clientHeight = this.ref.clientHeight;
  }

  /* updateStyles(): void {
    let overlay = {style:{}};
    overlay.style.backgroundColor = ;
    overlay.style.outlineColor = ;
    overlay.style.outlineOffset = ;
    overlay.style.outlineStyle = ;
    overlay.style.outlineWidth = ;
  } */

  /* private doPositionOverlay(options: { top: string; left: string; width: string; height: string }) {
    // Container
    const offsetHeight = this.getOverlayOffsetHeight();
    if(offsetHeight) {
      container.style.height = `calc(100% - ${offsetHeight}px)`;
    } else {
      container.style.height = '100%';
    }

    // Overlay
    overlay.style.top = options.top;
    overlay.style.left = options.left;
    overlay.style.width = options.width;
    overlay.style.height = options.height;
  } */

  doPositionOverlay(e: any): void { // mousePosX: number, mousePosY: number): void {
    // console.log('doPositionOverlay() is called..');
    let style = {};

    const clientWidth = this.clientWidth;
    const clientHeight = this.clientHeight;

    let mousePosX = e.offsetX;
    let mousePosY = e.offsetY;

    // console.log('{clientWidth, clientHeight} =', {clientWidth, clientHeight});
    // console.log('{mousePosX, mousePosY} =', {mousePosX, mousePosY});

    let edgeWidthThresholdFactor: number = 0.2; // 20% threshold to split
    let edgeHeightThresholdFactor: number = 0.2; // 20% threshold to split

    const edgeWidthThreshold = clientWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = clientHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = clientWidth / 3; // offer to split left/right at 33%
    const splitHeightThreshold = clientHeight / 3; // offer to split up/down at 33%

    // No split if mouse is above certain threshold in the center of the view
    // this.splitDirection = undefined;
    if(
      mousePosX > edgeWidthThreshold && mousePosX < clientWidth - edgeWidthThreshold &&
      mousePosY > edgeHeightThreshold && mousePosY < clientHeight - edgeHeightThreshold
    ) {
      this.splitDirection = undefined;
    }

    // Offer to split otherwise
    else {

      // prefers to split vertically: offer a larger hitzone
      // for this direction like so:
      // ------------------------------------
      // |         |  SPLIT UP    |         |
      // |  SPLIT  |--------------|  SPLIT  |
      // |         |    MERGE     |         |
      // |  LEFT   |--------------|  RIGHT  |
      // |         |  SPLIT DOWN  |         |
      // ------------------------------------
      if(mousePosX < splitWidthThreshold) {
        this.splitDirection = GroupDirection.LEFT;
      } else if(mousePosX > splitWidthThreshold * 2) {
        this.splitDirection = GroupDirection.RIGHT;
      } else if(mousePosY < clientHeight / 2) {
        this.splitDirection = GroupDirection.UP;
      } else {
        this.splitDirection = GroupDirection.DOWN;
      }
    }

    // Draw overlay based on split direction
    switch(this.splitDirection) {
      case GroupDirection.UP:
        style = { top: '0', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.DOWN:
        style = { top: '50%', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.LEFT:
        style = { top: '0', left: '0', width: '50%', height: '100%' };
        break;
      case GroupDirection.RIGHT:
        style = { top: '0', left: '50%', width: '50%', height: '100%' };
        break;
      default:
        style = { top: '0', left: '0', width: '100%', height: '100%' };
    }

    // Make sure the overlay is visible now
    this.props.onSetDropOverlay({
      ...this.props.dropOverlay,
      style: {
        ...style,
        opacity: '1',
      }
    });
  }

  onDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragStart event is called...');
    // console.log('e =', e);
    // this._startX = dom.offsetLeft;
    // this._startY = dom.offsetTop;
    // this._offsetX = e.clientX;
    // this._offsetY = e.clientY;
  }

  onDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragEnter event is called...');
    // console.log('e =', e);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
    this.showDropTarget = false;
    const { group, dropOverlay, groupId, terms_uid } = this.props;
    // console.log('dropOverlay =', dropOverlay);
    // console.log('uuid =', uuid);
    if(group && group.length > 0
      // && dropOverlay.id === uuid
    ) {
      // console.log('>>> 1');
      this.showDropTarget = true;
      this.props.onSetDropOverlay({
        ...dropOverlay,
        // drag_id: groupId,
        target_id: terms_uid,
        style: {
          ...this.props.dropOverlay.style,
          opacity: '1',
        },
      });
    }
    // this.setState({startDropOverlay: startDropOverlay});
  }

  makeDropTargetHide(): void {
    this.showDropTarget = false;
    const { dropOverlay, groupId } = this.props;
    this.props.onSetDropOverlay({
      ...dropOverlay,
      style: {
        ...this.props.dropOverlay.style,
        opacity: '0',
      },
    });
  }

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragLeave event is called...');
    this.makeDropTargetHide();
  }

  onDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragEnd event is called...');
  }

  onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    // console.log('onDragOver event is called...');
    e.preventDefault();

    // console.log('e =', e as DragEvent);
    // console.log('e.offsetX =', e.offsetX);
    // console.log('e.offsetY =', e.offsetY);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
    if(this.showDropTarget) {
      // this.doPositionOverlay(_e);
      this.throttle_doPositionOverlay(_e);
    }
  }

  onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDrop event is called...');
    e.preventDefault();
    this.makeDropTargetHide();
    const { tree, dropOverlay } = this.props;
    console.log(e.dataTransfer.getData('text/plain'));

    // find active item index
    const find_active = findActiveItem(tree, 0, []);
    // console.log('find_active =', find_active);

    if(find_active) {
      const { item: activeItem } = find_active;

      // // todo: turn off selected if not single
      // activeItem.selected = false;

      // // turn off active item
      // activeItem.active = false;
    }

    // find drag item
    const find_drag = findItemById(tree, 0, [], dropOverlay.drag_id);
    if(!find_drag)
      throw new Error('cannot find drag item');
    const { index: find_drag_index, pos: find_drag_pos, item: find_drag_item, group: find_drag_group, splitItem: find_drag_splitItem } = find_drag;
    // console.log('find_drag =', find_drag);

    switch(this.splitDirection) {
      // insert before
      case GroupDirection.UP:
      case GroupDirection.LEFT: {
        let mode: Mode = this.splitDirection === GroupDirection.UP ? 'vertical' : 'horizontal';

        // make split item
        if(find_drag_splitItem.mode !== mode) {
          if(find_drag_splitItem.list.length === 1) { // single list
            let $query: Spec<any, never>;;
            let new_tree;

            // copy group item into split list
            let new_split: SplitItem = { mode: mode, list: [] }
            let before_list = [], after_list = [];
            for(let i = 0; i < find_drag_group.length; i++) {
              if(find_drag_group[i].uid === find_drag_item.uid)
                before_list.push(find_drag_group[i]);
              else
                after_list.push(find_drag_group[i]);
            }
            after_list[before_list.length-1].selected = true;

            new_split.list.push(before_list);
            new_split.list.push(after_list);

            // replace split
            // ex) update(tree, { list: {  } });
            $query = { $set: new_split };
            for(let i = find_drag_index.length-1-1 /*  */; i > -1; i--) {
              $query = { list: { [find_drag_index[i]]: $query }};
            }
            console.log('$query =', $query);
            new_tree = update(tree, $query);

            console.log('new_tree =', new_tree);
            this.props.onSetTree(new_tree);
          } else { // list.length > 1
            let $query: Spec<any, never>;;
            let new_tree;

            let new_split: SplitItem = { mode: mode, list: [] }

            // copy group item into split list
            let before_list = [], after_list = [];
            for(let i = 0; i < find_drag_group.length; i++) {
              if(find_drag_group[i].uid === find_drag_item.uid)
                before_list.push(find_drag_group[i]);
              else
              after_list.push(find_drag_group[i]);
            }
            after_list[after_list.length-1].selected = true;

            new_split.list.push(before_list);
            new_split.list.push(after_list);
            // console.log('new_split =', new_split);

            // replace group into split
            // ex) update(tree, { list: {  } });
            $query = { $set: new_split };
            for(let i = find_drag_index.length-1; i > -1; i--) {
              $query = { list: { [find_drag_index[i]]: $query }};
            }
            console.log('$query =', $query);
            new_tree = update(tree, $query);

            console.log('new_tree =', new_tree);
            this.props.onSetTree(new_tree);
          }
        }
        // make group
        else {
          let $query: Spec<any, never>;
          let new_tree;

          // unshift group
          let new_group: any = [];
          new_group.push(find_drag_group[find_drag_pos]);
          $query = { list: { $unshift: [ new_group ] } }; // 주의: 배열
          for(let i = find_drag_index.length-1-1 /*  */; i > -1; i--) {
            $query = { list: { [find_drag_index[i]]: $query }};
          }
          console.log('$query =', $query);
          new_tree = update(tree, $query);
          console.log('new_tree =', new_tree);

          // splice item in group
          $query = { $splice: [[find_drag_pos, 1]] };
          for(let i = find_drag_index.length-1; i > -1; i--) {
            $query = { list: { [find_drag_index[i]]: $query }};
          }
          console.log('$query =', $query);
          new_tree = update(new_tree, $query);
          console.log('new_tree =', new_tree);

          this.props.onSetTree(new_tree);
        }
        break;
      }
      // insert after
      case GroupDirection.DOWN:
      case GroupDirection.RIGHT: {
        let mode: Mode = this.splitDirection === GroupDirection.DOWN ? 'vertical' : 'horizontal';

        // make split item
        if(find_drag_splitItem.mode !== mode) {
          if(find_drag_splitItem.list.length === 1) { // single list
            let $query: Spec<any, never>;;
            let new_tree;

            // copy group item into split list
            let new_split: SplitItem = { mode: mode, list: [] }
            let before_list = [], after_list = [];
            for(let i = 0; i < find_drag_group.length; i++) {
              if(find_drag_group[i].uid === find_drag_item.uid)
                after_list.push(find_drag_group[i]);
              else
                before_list.push(find_drag_group[i]);
            }
            before_list[before_list.length-1].selected = true;

            new_split.list.push(before_list);
            new_split.list.push(after_list);

            // replace split
            // ex) update(tree, { list: {  } });
            $query = { $set: new_split };

            for(let i = find_drag_index.length-1-1 /*  */; i > -1; i--) {
              $query = { list: { [find_drag_index[i]]: $query }};
            }
            console.log('$query =', $query);
            new_tree = update(tree, $query);

            console.log('new_tree =', new_tree);
            this.props.onSetTree(new_tree);
          } else { // list.length > 1
            let $query: Spec<any, never>;;
            let new_tree;

            let new_split: SplitItem = { mode: mode, list: [] }

            // copy group item into split list
            let before_list = [], after_list = [];
            for(let i = 0; i < find_drag_group.length; i++) {
              if(find_drag_group[i].uid === find_drag_item.uid)
                after_list.push(find_drag_group[i]);
              else
                before_list.push(find_drag_group[i]);
            }
            before_list[before_list.length-1].selected = true;

            new_split.list.push(before_list);
            new_split.list.push(after_list);
            // console.log('new_split =', new_split);

            // replace group into split
            // ex) update(tree, { list: {  } });
            $query = { $set: new_split };
            for(let i = find_drag_index.length-1; i > -1; i--) {
              $query = { list: { [find_drag_index[i]]: $query }};
            }
            console.log('$query =', $query);
            new_tree = update(tree, $query);

            console.log('new_tree =', new_tree);
            this.props.onSetTree(new_tree);
          }
        }
        // make group
        else {
          let $query: Spec<any, never>;
          let new_tree;

          // push group
          let new_group: any = [];
          new_group.push(find_drag_group[find_drag_pos]);
          $query = { list: { $push: [ new_group ] } }; // 주의: 배열
          for(let i = find_drag_index.length-1-1 /*  */; i > -1; i--) {
            $query = { list: { [find_drag_index[i]]: $query }};
          }
          console.log('$query =', $query);
          new_tree = update(tree, $query);
          console.log('new_tree =', new_tree);

          // splice item in group
          $query = { $splice: [[find_drag_pos, 1]] };
          for(let i = find_drag_index.length-1; i > -1; i--) {
            $query = { list: { [find_drag_index[i]]: $query }};
          }
          console.log('$query =', $query);
          new_tree = update(new_tree, $query);
          console.log('new_tree =', new_tree);

          this.props.onSetTree(new_tree);
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  /* onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDrop event is called...');
    e.preventDefault();
    this.makeDropTargetHide();
    const { tree, group, terms_uid } = this.props;
    console.log(e.dataTransfer.getData('text/plain'));

    // find active item index
    const activeItemPos = findActiveItemPos(tree, 0, []);
    console.log('activeItemPos =', activeItemPos);

    if(activeItemPos) {
      const activeItem = selectActiveItem(tree, 0, []);
      console.log('activeItem =', activeItem);
      // // turn off active item
      // if(activeItem) {
      //   activeItem.selected = false;
      //   activeItem.active = false;
      // }
    }

    // find target item index


    switch(this.splitDirection) {
      // insert before
      case GroupDirection.UP:
      case GroupDirection.LEFT: {
        const before_id = uuidv4();
        const after_id = uuidv4();

        // console.log('new_list =', new_list);
        // this.props.onSetList(new_list);
        break;
      }
      // insert after
      case GroupDirection.DOWN:
      case GroupDirection.RIGHT: {
        const before_id = uuidv4();
        const after_id = uuidv4();

        // console.log('new_list =', new_list);
        // this.props.onSetList(new_list);
        break;
      }
      default: {
        break;
      }
    }
  } */

  /* onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDrop event is called...');
    e.preventDefault();
    this.makeDropTargetHide();
    const { list, uid, pid, children } = this.props;
    console.log(e.dataTransfer.getData('text/plain'));

    let i = 0, j = 0; // active item index
    outer: for(i = 0; i < list.length; i++) {
      for(j = 0; j < list[i].children.length; j++) {
        if(list[i].children[j].active) {
          break outer;
        }
      }
    }

    // i and j are selected after loop
    i = i > list.length-1 ? list.length-1 : i;
    j = j > list[i].children.length-1 ? list[i].children.length-1 : j;
    console.log(`i = ${i}, j = ${j}`);

    console.log('pid =', pid);
    console.log('list =', list);

    let k = 0; // target item index
    for(k = 0; k < list.length; k++) {
      if(list[k].id === pid)
        break;
    }
    k = k > list.length-1 ? list.length-1 : k;
    console.log('k =', k);
    // if(k === -1)
    //   throw new Error('not valid target index');

    switch(this.splitDirection) {
      // insert before
      case GroupDirection.UP:
      case GroupDirection.LEFT: {
        // change target item into split item and attach current item before
        // 너무 복잡한데 이걸 이해할 수 있는 사람이 있을까?
        const before_id = uuidv4();
        const after_id = uuidv4();
        const replaced_children = [{id: before_id}, {id: after_id}];
        let mode = this.splitDirection === GroupDirection.UP ? 'vertical' : 'horizontal';
        const replaced_item = {...list[i], mode: mode, children: replaced_children};
        const attach_before: FlatItem = {id: before_id, children: [{id: list[i].children[j].id, selected: true, active: true}]};
        const after_children = [...list[i].children.slice(0, j), ...list[i].children.slice(j+1)];
        const attach_after: FlatItem = {id: after_id, children: after_children};

        // select the last one because there is none
        if(attach_after.children)
          attach_after.children[attach_after.children.length-1].selected = true;

        const attach_list: FlatItem[] = [replaced_item, attach_before, attach_after];
        const new_list = [...list.slice(0, k), ...attach_list, ...list.slice(k+1)];
        console.log('new_list =', new_list);
        this.props.onSetList(new_list);
        break;
      }
      // insert after
      case GroupDirection.DOWN:
      case GroupDirection.RIGHT: {
        const before_id = uuidv4();
        const after_id = uuidv4();
        const replaced_children = [{id: before_id}, {id: after_id}];
        let mode = this.splitDirection === GroupDirection.DOWN ? 'vertical' : 'horizontal';
        const replaced_item = {...list[i], mode: mode, children: replaced_children};

        const before_children = [...list[i].children.slice(0, j), ...list[i].children.slice(j+1)];
        const attach_before: FlatItem = {id: before_id, children: before_children};
        const attach_after: FlatItem = {id: after_id, children: [{id: list[i].children[j].id, selected: true, active: true}]};

        // select the last one because there is none
        if(attach_before.children)
          attach_before.children[attach_before.children.length-1].selected = true;

        const attach_list: FlatItem[] = [replaced_item, attach_before, attach_after];
        const new_list = [...list.slice(0, k), ...attach_list, ...list.slice(k+1)];
        console.log('new_list =', new_list);
        this.props.onSetList(new_list);
        break;
      }
      default: {
        break;
      }
    }
  } */

  render() {
    // console.log('uuid =', this.props.uuid);
    // const { style } = this.state;
    let self = this;
    return (
      <div ref={ref => this.ref = ref}
        className="drop-overlay"
        onDragStart={this.onDragStart.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        onDragEnd={this.onDragEnd.bind(this)}
        // onDragOver={this.onDragOver}
        onDragOver={this.onDragOver.bind(this)}
        // onDragOver={_.throttle(this.onDragOver.bind(this), 300, {trailing:false})}
        // onDragOver={throttle(this.onDragOver, 3000)}
        // onDragOver={throttle(() => { this.onDragOver.bind(this) }, 1000)}
        onDrop={this.onDrop.bind(this)}
        // style={style}
      >
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    dropOverlay: state.app.dropOverlay,
    tree: state.app.tree,
    // list: state.app.list,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetDropOverlay: (v: any) => dispatch(setDropOverlay(v)),
    onSetTree: (v: any) => dispatch(setTree(v)),
    // onSetList: (v: any) => dispatch(setList(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(DropOverlay);
