import React, { DragEvent, useRef } from 'react';
import { connect } from 'react-redux';
const debug = require('debug')('DropOverlay');
import _ from 'lodash';

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

interface DropOverlayProps {}

class DropOverlay extends React.Component<DropOverlayProps, {}> {

  // ref: React.MutableRefObject<HTMLDivElement | undefined>;
  ref: any;

  constructor(props: any) {
    super(props);
    // this.ref = useRef();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if(this.ref && this.ref.current) {
      const rect = this.ref.current.getBoundingClientRect();
      // You can now use rect to position other elements or for any other purpose
      console.log('rect =', rect);
    }
  }

  componentDidMount() {
    if(this.ref && this.ref.current) {
      const rect = this.ref.current.getBoundingClientRect();
      // You can now use rect to position other elements or for any other purpose
      console.log('rect =', rect);
    }
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
  }

  private positionOverlay(mousePosX: number, mousePosY: number): void {

    const editorControlWidth = this.groupView.element.clientWidth;
    const editorControlHeight = this.groupView.element.clientHeight - this.getOverlayOffsetHeight();

    let edgeWidthThresholdFactor: number;
    let edgeHeightThresholdFactor: number;
    edgeWidthThresholdFactor = 0.1; // 10% threshold to split if dragging editors
    edgeHeightThresholdFactor = 0.1; // 10% threshold to split if dragging editors

    const edgeWidthThreshold = editorControlWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = editorControlHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = editorControlWidth / 3;    // offer to split left/right at 33%
    const splitHeightThreshold = editorControlHeight / 3;  // offer to split up/down at 33%

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
    switch (splitDirection) {
      case GroupDirection.UP:
        this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '50%' });
        // this.toggleDropIntoPrompt(false);
        break;
      case GroupDirection.DOWN:
        this.doPositionOverlay({ top: '50%', left: '0', width: '100%', height: '50%' });
        // this.toggleDropIntoPrompt(false);
        break;
      case GroupDirection.LEFT:
        this.doPositionOverlay({ top: '0', left: '0', width: '50%', height: '100%' });
        // this.toggleDropIntoPrompt(false);
        break;
      case GroupDirection.RIGHT:
        this.doPositionOverlay({ top: '0', left: '50%', width: '50%', height: '100%' });
        // this.toggleDropIntoPrompt(false);
        break;
      default:
        this.doPositionOverlay({ top: '0', left: '0', width: '100%', height: '100%' });
        // this.toggleDropIntoPrompt(true);
    }

    // Make sure the overlay is visible now
    // const overlay = assertIsDefined(this.overlay);
    overlay.style.opacity = '1';
  } */

  onDragStart(e) {
    // console.log('onDragStart() is called...');
    // console.log('e =', e);
    // this._startX = dom.offsetLeft;
    // this._startY = dom.offsetTop;
    // this._offsetX = e.clientX;
    // this._offsetY = e.clientY;
  }

  onDragEnter(e) {
    // console.log('onDragEnter() is called...');
    // console.log('e =', e);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
  }

  onDragLeave(e) {
    // console.log('onDragLeave() is called...');
  }
  onDragEnd(e) {
    // console.log('onDragEnd() is called...');
  }
  onDragOver(e) {
    // console.log('onDragOver() is called...');
    // console.log('e =', e as DragEvent);
    // console.log('e.offsetX =', e.offsetX);
    // console.log('e.offsetY =', e.offsetY);
    let _e = e.nativeEvent;
    // console.log('_e =', _e);
    // this.positionOverlay(_e.offsetX, _e.offsetY);
  }
  onDrop(e) {
    // console.log('onDrop() is called...');
  }

  render() {
    return (
      <div ref={ref => this.ref = ref}
        className="drop-overlay"
        // onDragStart={this.onDragStart}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        onDragEnd={this.onDragEnd.bind(this)}
        onDragOver={_.throttle(this.onDragOver.bind(this), 100)}
        onDrop={this.onDrop.bind(this)}
        style={{}}
      >
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

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(DropOverlay);
