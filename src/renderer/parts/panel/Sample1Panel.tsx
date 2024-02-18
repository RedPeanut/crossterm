import React from 'react';
import { connect } from 'react-redux';

interface Sample1PanelProps {
  sidePanel: { active: string, visible: boolean };
}

class Sample1Panel extends React.Component<Sample1PanelProps, {}> {
  componentDidMount() {}

  render() {
    const { sidePanel } = this.props;
    const cls = 'side-panel bookmark-panel'
      + (sidePanel.active === 'Sample1' ? ' active' : '');
    return (
      <div className={cls}>
        This is sample1
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

export default connect(mapStateToProps, null)(Sample1Panel);
