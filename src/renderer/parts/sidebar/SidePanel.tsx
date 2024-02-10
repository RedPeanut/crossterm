import React from 'react';
import { connect } from 'react-redux';

interface SidePanelProps {
  sidePanel: { active: string, visible: boolean };
  children: React.ReactNode;
}

class SidePanel extends React.Component<SidePanelProps, {}> {
  componentDidMount() {}

  render() {
    const { sidePanel } = this.props;
    return (
      <div
        id="side-panel"
        style={{
          // left: DEFAULT_SIDE_BAR_WIDTH,
          // width: DEFAULT_SIDE_PANEL_WIDTH,
          // height: screen.height,
          display: sidePanel.visible ? 'block' : 'none',
        }}
      >
        { this.props.children }

        <div className="sash-container">
          <div className="sash vertical"></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    screen: state.app.screen,
    sidePanel: state.app.sidePanel,
  };
};

/* const mapDispatchToProps = (dispatch) => {
  return {
    onSetSomeVal: (value) => dispatch(setSomeVal(value)),
  };
}; */

export default connect(mapStateToProps, null)(SidePanel);
