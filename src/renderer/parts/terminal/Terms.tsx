import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../../reducers/sample';
import { v4 as uuidv4 } from 'uuid';
import { Terminal_, SplitItem, isTerminal, isSplitItem } from '../../Types';
import DropOverlay from '../DropOverlay';
import DropTarget from '../DropTarget';
import Term from './Term';

interface TermsProps {
  list: Terminal_[];
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
    return (
      <div
        className='terms-container'
      >
        <Term /* uid={this.uid} */ />
        {/* <DropTarget uid={this.uid} />
        <DropOverlay uid={this.uid} list={this.props.list} /> */}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    someVal: state.sample.someVal,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetSomeVal: (v: any) => dispatch(setSomeVal(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Terms);
