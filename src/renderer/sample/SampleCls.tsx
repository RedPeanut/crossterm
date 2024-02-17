import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../reducers/sample';

interface SampleClsProps {}
interface SampleClsState {}

class SampleCls extends React.Component<SampleClsProps, SampleClsState> {

  public static defaultProps = {};

  constructor(props: any) {
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
