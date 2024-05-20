import React from 'react';
import { connect } from 'react-redux';
import { FlatItem } from 'renderer/Types';
import DropOverlay from './DropOverlay';
import DropTarget from './DropTarget';

interface Props {
  children: FlatItem[];
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
    const {  dropOverlay, uid, children } = this.props;
    return (
      <div>
        {
          // dropOverlay.visible ?
          true ?
            <div>
              <DropTarget uid={uid} />
              <DropOverlay uid={uid} children={children} />
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
