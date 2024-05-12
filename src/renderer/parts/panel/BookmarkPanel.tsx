import React from 'react';
import { connect } from 'react-redux';
import List from '../list/List';

// import 'rc-tree/assets/index.css'
// import Tree, { TreeNode } from 'rc-tree';

interface BookmarkPanelProps {
  sidePanel: { active: string, visible: boolean };
}

class BookmarkPanel extends React.Component<BookmarkPanelProps, {}> {

  /* // ref;
  tree: any;
  treeData = [
    {
      key: '0-0',
      title: 'parent 1',
      children: [
        { key: '0-0-0', title: 'parent 1-1',
          children: [
            { key: '0-0-0-0', title: 'parent 1-1-0' }
          ]
        },
        {
          key: '0-0-1',
          title: 'parent 1-2',
          children: [
            { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
            { key: '0-0-1-1', title: 'parent 1-2-1' },
            { key: '0-0-1-2', title: 'parent 1-2-2' },
            { key: '0-0-1-3', title: 'parent 1-2-3' },
            { key: 1128, title: 1128 },
          ],
        },
      ],
    },
  ]; */

  constructor(props: BookmarkPanelProps) {
    super(props);
    // this.ref = React.createRef();
  }

  componentDidMount() {}

  /* onExpand = (expandedKeys: any) => {
    console.log('onExpand', expandedKeys);
  };

  onDragStart = (info: any) => {
    console.log('onDragStart', info);
  };

  onDragEnter = () => {
    console.log('onDragEnter');
  };

  onDrop = (info: any) => {
    console.log('onDrop', info);
  } */

  render() {
    const { sidePanel } = this.props;
    const cls = 'item bookmark-panel'
      + (sidePanel.active === 'Bookmarks' ? ' active' : '');
    return (
      <div className={cls}>
        <List />
        {/* <Tree
          ref = { tree => { this.tree = tree; } }
          checkable
          draggable
          defaultExpandAll
          onExpand={this.onExpand}
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
          treeData={this.treeData}
        /> */}
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

export default connect(mapStateToProps, null)(BookmarkPanel);
