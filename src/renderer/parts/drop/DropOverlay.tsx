import React, {  } from 'react';
import { connect } from 'react-redux';
import _, { DebouncedFunc } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { throws } from 'assert';
import { setDropOverlay, setList } from '../../reducers/app';
import { FlatItem } from '../../Types';
const debug = require('debug')('DropOverlay');

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

interface DropOverlayProps {
  uid: string;
  // list: Terminal_[];
  pid: string;
  children?: FlatItem[];

  // mapped values
  dropOverlay: any; onSetDropOverlay: any;
  list: any; onSetList: any;
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

  private doPositionOverlay(e: any): void { // mousePosX: number, mousePosY: number): void {

    let style = {};

    const editorControlWidth = this.clientWidth;
    const editorControlHeight = this.clientHeight;

    let mousePosX = e.offsetX;
    let mousePosY = e.offsetY;

    // console.log('{clientWidth, clientHeight} =', {clientWidth, clientHeight});
    // console.log('{mousePosX, mousePosY} =', {mousePosX, mousePosY});

    let edgeWidthThresholdFactor: number = 0.2; // 20% threshold to split
    let edgeHeightThresholdFactor: number = 0.2; // 20% threshold to split

    const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = editorControlWidth / 3; // offer to split left/right at 33%
    const splitHeightThreshold = editorControlHeight / 3; // offer to split up/down at 33%

    // No split if mouse is above certain threshold in the center of the view
    // this.splitDirection = undefined;
    if(
      mousePosX > edgeWidthThreshold && mousePosX < editorControlWidth - edgeWidthThreshold &&
      mousePosY > edgeHeightThreshold && mousePosY < editorControlHeight - edgeHeightThreshold
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
      } else if(mousePosY < editorControlHeight / 2) {
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
    console.log('onDragStart() is called...');
    // console.log('e =', e);
    // this._startX = dom.offsetLeft;
    // this._startY = dom.offsetTop;
    // this._offsetX = e.clientX;
    // this._offsetY = e.clientY;
  }

  onDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragEnter() is called...');
    // console.log('e =', e);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
    this.showDropTarget = false;
    const { children, dropOverlay, uid } = this.props;
    // console.log('dropOverlay =', dropOverlay);
    // console.log('uuid =', uuid);
    if(children && children.length > 0
      // && dropOverlay.id === uuid
    ) {
      // console.log('>>> 1');
      this.showDropTarget = true;
      this.props.onSetDropOverlay({
        ...dropOverlay,
        id: uid,
        // style: {
        //   ...this.props.dropOverlay.style,
        //   opacity: '1',
        // },
        // showDropTarget: true,
      });
    }
    // this.setState({startDropOverlay: startDropOverlay});
  }

  private makeDropTargetHide(): void {
    this.showDropTarget = false;
    const { dropOverlay, uid } = this.props;
    this.props.onSetDropOverlay({
      ...dropOverlay,
      style: {
        ...this.props.dropOverlay.style,
        opacity: '0',
      },
    });
  }

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragLeave() is called...');
    this.makeDropTargetHide();
  }

  onDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragEnd() is called...');
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
        // console.log('new_list =', new_list);
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
        // console.log('new_list =', new_list);
        this.props.onSetList(new_list);
        break;
      }
    }
  }

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
    list: state.app.list,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetDropOverlay: (v: any) => dispatch(setDropOverlay(v)),
    onSetList: (v: any) => dispatch(setList(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(DropOverlay);
