import React from 'react';
import { connect } from 'react-redux';
import { TerminalItem } from 'common/Types';
import DropOverlay from 'renderer/parts/drop/DropOverlay';
import DropTarget from 'renderer/parts/drop/DropTarget';

interface Props {
  // pid: string;
  // children: FlatItem[];
  group: TerminalItem[];
  groupId: string;
  terms_uid: string;

  // mapped value
  dropOverlay: any;
}
interface State {}

class Wrapper extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  // update - render 전 - (props, state 변경시, true만 render 호출)
  shouldComponentUpdate(nextProps: any, nextState: any) {
    // console.log('shouldComponentUpdate() is called...');
    /* if(nextProps.dropOverlay && nextProps.dropOverlay.style && nextProps.dropOverlay.target_id === this.props.terms_uid)
      return true;
    else
      return false; */
    return true;
  }

  componentDidMount() {}

  render() {
    const { dropOverlay, groupId, group, terms_uid } = this.props;
    return (
      <div>
        {
          dropOverlay.visible ?
            <div>
              <DropTarget groupId={groupId} terms_uid={terms_uid} />
              <DropOverlay groupId={groupId} group={group} terms_uid={terms_uid} />
            </div>
          : null
        }
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
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);
