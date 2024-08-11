import React, { DragEvent, useRef } from 'react';
import { connect } from 'react-redux';
const debug = require('debug')('DropTarget');

interface DropTargetProps {
  // children?: React.ReactElement | React.ReactElement[];
  // list: Terminal[];
  // ref?: string;
  groupId?: string;
  terms_uid: string;
  key?: string;

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
    /* if(nextProps.dropOverlay && nextProps.dropOverlay.style) {
      if(nextProps.dropOverlay.target_id !== this.props.terms_uid)
        return false;
      else
        return JSON.stringify(nextProps.dropOverlay) !== JSON.stringify(this.props.dropOverlay)
    }
    return false; */
    return true;
  }

  // update - render 후 (props, state 변경시)
  componentDidUpdate(prevProps: any, prevState: any) {}

  componentDidMount() {
    // console.log('this.props =', this.props);
  }

  render() {
    // console.log('render() is called..');
    // console.log('ref =', this.props.ref);
    // console.log('id =', this.props.id);
    // console.log('key =', this.props.key);
    // console.log('uuid =', this.props.uuid);

    const { dropOverlay, terms_uid } = this.props;
    // console.log('dropOverlay =', dropOverlay);
    // console.log('terms_uid =', terms_uid);
    let opacity = (dropOverlay.style && dropOverlay.style.opacity) ? dropOverlay.style.opacity : '0';
    if(opacity === '1') {
      if(dropOverlay.target_id !== terms_uid)
        opacity = '0';
    }
    let style = { ...dropOverlay.style, opacity: opacity };
    // console.log('style =', style);
    // console.log('opacity =', opacity);

    return (
      <div ref={ref => this.ref = ref}
        className="drop-target"
        style={style}
      >
        {/* { this.props.children } */}
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
