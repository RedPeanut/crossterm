import React from 'react';
import { connect } from 'react-redux';
// import { setSomeVal } from '../../reducers/sample';
import { v4 as uuidv4 } from 'uuid';
import { Terminal_, SplitItem, isTerminal_, isSplitItem } from '../../Types';
import DropOverlay from '../DropOverlay';
import DropTarget from '../DropTarget';
import Term from './Term';

interface TermsProps {
  list: Terminal_[];

  // mapped value
  dropOverlay: any;
}

interface TermsState {}

class Terms extends React.Component<TermsProps, TermsState> {

  public static defaultProps = {};

  uid: string;

  constructor(props: TermsProps) {
    super(props);
    this.uid = uuidv4();
  }

  componentDidMount() {}

  render() {
    const { dropOverlay } = this.props;
    return (
      <div
        className='terms-container'
      >
        <Term /* uid={this.uid} */ />
        { dropOverlay.visible ?
          <div>
            <DropTarget uid={this.uid} />
            <DropOverlay uid={this.uid} list={this.props.list} />
          </div>
        : null }
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Terms);
