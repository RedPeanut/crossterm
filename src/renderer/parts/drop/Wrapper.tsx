import React from 'react';
import { connect } from 'react-redux';
import { FlatItem, Terminal } from 'renderer/Types';
import DropOverlay from 'renderer/parts/drop/DropOverlay';
import DropTarget from 'renderer/parts/drop/DropTarget';

interface Props {
  pid: string;
  // children: FlatItem[];
  list: Terminal[];
  uid: string;

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
    const { dropOverlay, uid, pid, list } = this.props;
    return (
      <div>
        {
          dropOverlay.visible ?
          // true ?
            <div>
              <DropTarget uid={uid} />
              <DropOverlay uid={uid} pid={pid} list={list} />
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
