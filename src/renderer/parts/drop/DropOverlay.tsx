import React, {  } from 'react';
import { connect } from 'react-redux';
import { FlatItem } from '../../Types';
import _ from 'lodash';
import { setDropOverlay } from '../../reducers/app';
const debug = require('debug')('DropOverlay');

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

interface DropOverlayProps {
  // list: Terminal_[];
  children: FlatItem[];
  uid: string;

  // mapped values
  dropOverlay: any;
  onSetDropOverlay: any;
}

interface DropOverlayState {}

class DropOverlay extends React.Component<DropOverlayProps, DropOverlayState> {

  // ref: React.MutableRefObject<HTMLDivElement | undefined>;
  ref: any;
  clientWidth: number;
  clientHeight: number;
  showDropTarget!: boolean;

  constructor(props: DropOverlayProps) {
    super(props);
    // this.ref = useRef();
    this.clientWidth = -1;
    this.clientHeight = -1;

    this.state = {};
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

  private positionOverlay(e: any): void { // mousePosX: number, mousePosY: number): void {

    let style = {};

    const editorControlWidth = this.clientWidth;
    const editorControlHeight = this.clientHeight;

    let mousePosX = e.offsetX;
    let mousePosY = e.offsetY;

    // console.log('{clientWidth, clientHeight} =', {clientWidth, clientHeight});
    // console.log('{mousePosX, mousePosY} =', {mousePosX, mousePosY});

    let edgeWidthThresholdFactor: number = 0.2; // 20% threshold to split if dragging editors
    let edgeHeightThresholdFactor: number = 0.2; // 20% threshold to split if dragging editors

    const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = editorControlWidth / 3; // offer to split left/right at 33%
    const splitHeightThreshold = editorControlHeight / 3; // offer to split up/down at 33%

    // No split if mouse is above certain threshold in the center of the view
    let splitDirection: GroupDirection | undefined;
    if(
      mousePosX > edgeWidthThreshold && mousePosX < editorControlWidth - edgeWidthThreshold &&
      mousePosY > edgeHeightThreshold && mousePosY < editorControlHeight - edgeHeightThreshold
    ) {
      splitDirection = undefined;
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
        splitDirection = GroupDirection.LEFT;
      } else if(mousePosX > splitWidthThreshold * 2) {
        splitDirection = GroupDirection.RIGHT;
      } else if(mousePosY < editorControlHeight / 2) {
        splitDirection = GroupDirection.UP;
      } else {
        splitDirection = GroupDirection.DOWN;
      }
    }

    // Draw overlay based on split direction
    switch(splitDirection) {
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

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragLeave() is called...');
    /* this.setState({startDropOverlay: false});
    this.setState({
      style: {
        ...this.state.style,
        opacity: '0',
      }
    }); */
    this.showDropTarget = false;
    const { dropOverlay, uid } = this.props;
    // if(dropOverlay.id === uuid) {
      // console.log('>>> 1');
      this.props.onSetDropOverlay({
        ...dropOverlay,
        style: {
          ...this.props.dropOverlay.style,
          opacity: '0',
        },
        // showDropTarget: false,
      });
    // }
    /* this.props.onSetDropOVerlay({
      // ...this.props.dropOverlay,
      opacity: '0',
    }); */
  }

  onDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragEnd() is called...');
  }

  onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDragOver() is called...');
    // console.log('e =', e as DragEvent);
    // console.log('e.offsetX =', e.offsetX);
    // console.log('e.offsetY =', e.offsetY);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
    if(this.showDropTarget)
      this.positionOverlay(_e);
  }

  onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    console.log('onDrop event is called...');
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
        // onDragOver={this.onDragOver.bind(this)}
        onDragOver={_.throttle(this.onDragOver.bind(this), 300, {trailing:false})}
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetDropOverlay: (v: any) => dispatch(setDropOverlay(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(DropOverlay);
