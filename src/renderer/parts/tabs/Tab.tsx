import React from 'react';
import { connect } from 'react-redux';
import _, { DebouncedFunc } from 'lodash';
import classnames from 'classnames';
import { FlatItem } from 'renderer/Types';
import { setDropOverlay, setList } from 'renderer/reducers/app';
import { getItemIndex } from 'renderer/util';

interface TabProps {
  // terminal: Terminal_;
  item: FlatItem;

  // mapped value
  dropOverlay: any; onSetDropOverlay: any;
  list: any; onSetList: any;
}

interface TabState {}

class Tab extends React.Component<TabProps, TabState> {

  ref: any;
  clientWidth: number = -1;
  clientHeight: number = -1;
  throttle_doDragOver: DebouncedFunc<(...args: any[]) => any>;

  constructor(props: TabProps) {
    super(props);
    this.throttle_doDragOver = _.throttle(this.doDragOver.bind(this), 300, {trailing:false});
  }

  componentDidMount() {
    this.clientWidth = this.ref.clientWidth;
    this.clientHeight = this.ref.clientHeight;
  }

  onDragStart = (e: React.DragEvent<HTMLDivElement>): void => {
    // console.log('onDragStart event is called...');
    // console.log('id =', id);
    // console.log('dom =', dom);
    // console.log('e =', e);
    e.dataTransfer.setData('text/plain', JSON.stringify(this.props.item));
    this.props.onSetDropOverlay({
      ...this.props.dropOverlay,
      visible: true
    });
  };

  onDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    // console.log('onDragEnter event is called...');
    const target = e.target as HTMLElement;
  };

  onDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    // console.log('onDragLeave event is called...');
  };

  onDragEnd = (e: React.DragEvent<HTMLDivElement>): void => {
    // console.log('onDragEnd event is called...');
    this.props.onSetDropOverlay({
      ...this.props.dropOverlay,
      visible: false,
    });
  };

  // (property) React.BaseSyntheticEvent
  // <DragEvent, EventTarget & HTMLDivElement, EventTarget>
  // .nativeEvent: DragEvent
  private doDragOver(e: DragEvent): void {
    const clientWidth = this.clientWidth;
    const clientHeight = this.clientHeight;
    const mousePosX = e.offsetX;
    const mousePosY = e.offsetY;
    const widthThreshold = clientWidth / 2;
    let direction;
    if(mousePosX < widthThreshold) {
      direction = 'LEFT';
    } else {
      direction = 'RIGHT';
    }
    switch(direction) {
      case 'LEFT': break;
      case 'RIGHT': break;
    }
  }

  onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    this.throttle_doDragOver(e.nativeEvent);
  }

  onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();

  }

  handleContextMenu = (e: any) => { console.log('handleContextMenu() is called...'); };

  onClick(e: any) {
    // change active in here
    const { list, item } = this.props;

    // get active item index
    const { i: i, j: j } = getItemIndex(list, (item: FlatItem) => {
      if(item.active) return true;
      else return false;
    });

    // console.log(list);
    // console.log({i,j});

    // turn off previous selected item
    const prev_cloned_item = _.cloneDeep(list[i]);
    console.log('prev_cloned_item =', prev_cloned_item);
    prev_cloned_item.children[j].selected = false;
    prev_cloned_item.children[j].active = false;
    const prev_replaced_list = [
      ...list.slice(0, i),
      prev_cloned_item,
      ...list.slice(i+1)
    ];
    // console.log(prev_replaced_list);

    // get this item index
    const { i: _i, j: _j } = getItemIndex(list, (_item: FlatItem) => {
      if(_item.id === item.id) return true;
      else return false;
    });
    // console.log({_i,_j});

    // turn on this item
    const this_cloned_item = _.cloneDeep(prev_replaced_list[_i]);
    this_cloned_item.children[_j].selected = true;
    this_cloned_item.children[_j].active = true;
    const this_replaced_list = [
      ...prev_replaced_list.slice(0, _i),
      this_cloned_item,
      ...prev_replaced_list.slice(_i+1)
    ];
    // console.log(this_replaced_list);

    this.props.onSetList(this_replaced_list);
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
      <div
        ref={ref => this.ref = ref}
        className={classnames("tab", item.selected ? 'selected' : null, item.active ? 'active' : null)}
        style={style}
        // selected='false'
        onClick={this.onClick.bind(this)}
        draggable
        onDragStart={this.onDragStart}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragEnd={this.onDragEnd}
        // onDrag={this.onDrag}
        onDragOver={this.onDragOver}
        // onDragExit={this.onDragExit}
        onDrop={this.onDrop}
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
    list: state.app.list,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetDropOverlay: (v: any) => dispatch(setDropOverlay(v)),
    onSetList: (v: any) => dispatch(setList(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(Tab);
