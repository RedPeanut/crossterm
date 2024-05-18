import React, { DragEvent, useRef } from 'react';
import { connect } from 'react-redux';
import { Terminal_, SplitItem, isTerminal_, isSplitItem } from '../../Types';
const debug = require('debug')('DropTarget');

interface DropTargetProps {
  children?: React.ReactElement | React.ReactElement[];
  // list: Terminal[];
  // ref?: string;
  id?: string;
  key?: string;
  uid?: string;

  // mapped value
  dropOverlay: any;
}

interface DropTargetState {
  // style: {},
  // showDropTarget: boolean,
}

class DropTarget extends React.Component<DropTargetProps, DropTargetState> {

  // ref: React.MutableRefObject<HTMLDivElement | undefined>;
  ref: any;

  constructor(props: DropTargetProps) {
    super(props);
    // this.ref = useRef();

    this.state = {
      // style: {},
      // showDropTarget: false,
    };
  }

  // componentWillReceiveProps -> shouldComponentUpdate -> componentDidUpdate

  // update - render 전 - (props, state 변경시, true만 render 호출)
  shouldComponentUpdate(nextProps: any, nextState: any) {
    // console.log('shouldComponentUpdate() is called...');
    // console.log(`nextProps = ${JSON.stringify(nextProps)}, nextState = ${JSON.stringify(nextState)}`);
    if(nextProps.dropOverlay && nextProps.dropOverlay.style) {
      if(nextProps.dropOverlay.id !== this.props.uid)
        return false;
      else
        return JSON.stringify(nextProps.dropOverlay) !== JSON.stringify(this.props.dropOverlay)
    }
    return false;
  }

  // update - render 후 (props, state 변경시)
  componentDidUpdate(prevProps: any, prevState: any) {}

  componentDidMount() {
    // console.log('this.props =', this.props);
  }

  render() {
    // console.log('ref =', this.props.ref);
    // console.log('id =', this.props.id);
    // console.log('key =', this.props.key);
    // console.log('uuid =', this.props.uuid);
    const { dropOverlay } = this.props;
    return (
      <div ref={ref => this.ref = ref}
        className="drop-target"
        style={dropOverlay.style}
      >
        { this.props.children }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    // showDropTarget: state.app.showDropTarget,
    dropOverlay: state.app.dropOverlay,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(DropTarget);
