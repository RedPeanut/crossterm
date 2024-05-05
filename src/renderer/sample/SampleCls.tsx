import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../reducers/sample';

interface Props {
  // mapped value
  someVal: any, onSetSomeVal: any;
}
interface State {}

class SampleCls extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SampleCls);
