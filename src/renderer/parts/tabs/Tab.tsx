import React from 'react';
import { connect } from 'react-redux';

interface TabProps {
  children?: React.ReactElement | React.ReactElement[];
}

class Tab extends React.Component<TabProps, {}> {

  constructor(props: TabProps) {
    super(props);
  }

  componentDidMount() {
  }

  onDragStart = (e: DragEvent): void => {
    // e.dataTransfer?.setData('text/plain', JSON.stringify(''));
    // console.log('id =', id);
    // console.log('dom =', dom);
    // console.log('e =', e);
  };

  findTargetGroupView = () => {
    //
  };

  onDragEnter = (e: DragEvent): void => {
    // console.log('onDragEnter event is called...');
    const target = e.target as HTMLElement;
    // console.log('target =', target);
    /* if(!this.overlay) {
      const targetGroupView = this.findTargetGroupView(target);
      if(targetGroupView)
      this.overlay = this.createInstance(DropOverlay, this, targetGorupView);
    } */
  };
  onDragLeave = (): void => {
    // console.log('onDragLeave event is called...');
  };
  onDragEnd = (): void => {
    // console.log('onDragEnd event is called...');
  };

  handleContextMenu = (e) => { console.log('handleContextMenu() is called...'); };

  render() {
    const { children } = this.props;
    // console.log('this.props =', this.props);

    return (
      <div className="tab"
        draggable
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragEnd={this.onDragEnd}
        onDragStart={this.onDragStart}
        // onDrag={this.onDrag}
        // onDragOver={this.onDragOver}
        // onDragExit={this.onDragExit}
        // onDrop={this.onDrop}
        onContextMenu={this.handleContextMenu}
      >
        탭입니다
      </div>
    );
  }
};

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Tab);

