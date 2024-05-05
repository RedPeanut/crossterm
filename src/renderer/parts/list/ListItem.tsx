import React from 'react';
import { connect } from 'react-redux';
import { setSomeVal } from '../../reducers/sample';
import styles from './ListItem.module.scss'
import classnames from 'classnames';
import ItemIcon from '../ItemIcon';
import { ListObject } from '../../Types';

interface ListItemProps {
  data: ListObject;

  // mapped value
  someVal: any, onSetSomeVal: any;
}
interface ListItemState {}

class ListItem extends React.Component<ListItemProps, ListItemState> {

  public static defaultProps = {};

  constructor(props: ListItemProps) {
    super(props);
  }

  componentDidMount() {}

  render() {
    const { data } = this.props;
    return (
      <div
        className={classnames('list-item', styles.selected)}
        onContextMenu={(e) => {}}
      >
        <div className={styles.title} /* onClick={onSelect} */>
        <span className={classnames(styles.icon/* , is_folder && styles.folder */)} /* onClick={this.toggleIsCollapsed} */>
          <ItemIcon type={data.type} is_collapsed={data.is_collapsed} />
        </span>
        {data.title/*  || lang.untitled */}
      </div>
        <div className={styles.status}>
          <div className={styles.edit}></div>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);
