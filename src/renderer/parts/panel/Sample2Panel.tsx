import React from 'react';
import { connect } from 'react-redux';

interface Sample2PanelProps {
  sidePanel: { active: string, visible: boolean };
}

class Sample2Panel extends React.Component<Sample2PanelProps, {}> {
  componentDidMount() {}

  render() {
    const { sidePanel } = this.props;
    const cls = 'item sample2-panel'
      + (sidePanel.active === 'Sample2' ? ' active' : '');
    return (
      <div className={cls}>
        This is sample2
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    sidePanel: state.app.sidePanel,
  };
};

/* const mapDispatchToProps = (dispatch) => {
  return {};
}; */

export default connect(mapStateToProps, null)(Sample2Panel);
