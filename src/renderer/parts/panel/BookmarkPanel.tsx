import React from 'react';
import { connect } from 'react-redux';

interface BookmarkPanelProps {
  sidePanel: { active: string, visible: boolean };
}

class BookmarkPanel extends React.Component<BookmarkPanelProps, {}> {
  componentDidMount() {}

  render() {
    const { sidePanel } = this.props;
    const cls = 'side-panel bookmark-panel'
      + (sidePanel.active === 'Bookmarks' ? ' active' : '');
    return (
      <div className={cls}>
        This is bookmark
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
  return {
    onSetSomeVal: (value) => dispatch(setSomeVal(value)),
  };
}; */

export default connect(mapStateToProps, null)(BookmarkPanel);
