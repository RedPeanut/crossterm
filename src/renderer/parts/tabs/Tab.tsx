import React from 'react';
import { connect } from 'react-redux';
import { Terminal_, SplitItem, isTerminal_, isSplitItem, FlatItem } from '../../Types';
import { setDropOverlay } from '../../reducers/app';
import classnames from 'classnames';

interface TabProps {
  // terminal: Terminal_;
  item: FlatItem;

  //
  dropOverlay: any;
  onSetDropOverlay: any;
}

class Tab extends React.Component<TabProps, {}> {

  constructor(props: TabProps) {
    super(props);
  }

  componentDidMount() {
  }

  onDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    // e.dataTransfer?.setData('text/plain', JSON.stringify(''));
    // console.log('id =', id);
    // console.log('dom =', dom);
    // console.log('e =', e);
    this.props.onSetDropOverlay({
      ...this.props.dropOverlay,
      visible: true
    });
  };

  findTargetGroupView = () => {
    //
  };

  onDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
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
    this.props.onSetDropOverlay({
      ...this.props.dropOverlay,
      visible: false,
    });
  };

  handleContextMenu = (e: any) => { console.log('handleContextMenu() is called...'); };

  onClick(e: any) {

  }

  render() {
    const { item } = this.props;
    // console.log('this.props =', this.props);

    let style: {} = {
      '--tab-border-bottom-color': 'rgb(31, 31, 31)',
      '--tab-border-top-color': 'rgb(0, 120, 212)',
    };

    let border_top_container_style;
    if(!item.active)
      border_top_container_style = { display: 'none'}

    return (
      <div className={classnames("tab", item.selected ? 'selected' : null, item.active ? 'active' : null)}
        style={style}
        // selected='false'
        onClick={this.onClick}
        draggable
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        // onDrag={this.onDrag}
        // onDragOver={this.onDragOver}
        // onDragExit={this.onDragExit}
        // onDrop={this.onDrop}
        onContextMenu={this.handleContextMenu}
      >
        <div className='tab-border-top-container' style={border_top_container_style}></div>
        <div className='label'>탭입니다</div>
        <div className='tab-actions'></div>
        <div className='tab-border-bottom-container'></div>
      </div>
    );
  }
};

const mapStateToProps = (state: any) => {
  return {
    dropOverlay: state.app.dropOverlay,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetDropOverlay: (v: any) => dispatch(setDropOverlay(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Tab);

