import React from 'react';
import { connect } from 'react-redux';
import { TerminalItem } from 'common/Types';
import DropOverlay from 'renderer/parts/drop/DropOverlay';
import DropTarget from 'renderer/parts/drop/DropTarget';

interface Props {
  // pid: string;
  // children: FlatItem[];
  group: TerminalItem[];
  terms_uid: string;

  // mapped value
  dropOverlay: any;
}
interface State {}

class Wrapper extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    const { dropOverlay, terms_uid, group } = this.props;
    return (
      <div>
        {
          dropOverlay.visible ?
          // true ?
            <div>
              <DropTarget terms_uid={terms_uid} />
              <DropOverlay terms_uid={terms_uid} group={group} />
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
