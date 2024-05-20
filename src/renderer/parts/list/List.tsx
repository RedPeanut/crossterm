import React from 'react';
import { connect } from 'react-redux';
// import { setSomeVal } from '../../reducers/sample';
// import styles from './List.module.scss'
import classnames from 'classnames';
import ItemIcon from '../ItemIcon';
import ListItem from './ListItem';
import Tree from '../tree/Tree';
import { Center } from '@chakra-ui/react';
import { BiChevronRight } from 'react-icons/bi';
import { setList } from 'renderer/reducers/app';
import { v4 as uuidv4 } from 'uuid';
import { FlatItem } from 'renderer/Types';

interface ListProps {
  // mapped value
  list: any, onSetList: any;
}

interface ListState {
  selected_ids: string[];
}

class List extends React.Component<ListProps, ListState> {

  constructor(props: ListProps) {
    super(props);
    this.state = {
      selected_ids: ['0']
    };
  }

  componentDidMount() {}

  onDoubleClick(id: string) {
    // find active tabs -> add tab after selected one in here..
    const { list } = this.props;

    if(list && list.length > 0) {
      const _new = [];
      const root: FlatItem = {id:'0',children:[]};
      const _children = [...list[0].children];
      for(let i = 0; i < list[0].children.length; i++) {
        list[0].children[i].selected = false;
        list[0].children[i].active = false;
      }
      root.children = _children;
      const newOne = {id:uuidv4(),selected:true,active:true};
      _children.push(newOne);
      _new.push(root);
      this.props.onSetList(_new);
    }
  }

  render() {

    const data = [
      {
        "type": "folder",
        "title": "folder",
        "id": "52528ee3-aa4f-44a5-b763-5cf69acacf51",
        "on": false,
        "children": [
          {
            "title": "xyz",
            "id": "e54af9c1-f003-4b1b-8db4-e796f69a9a4d",
            "on": true
          },
          {
            "title": "title1",
            "id": "96367ed9-6fb1-434b-b45d-de9d2d21898a",
            "on": true
          },
          {
            "title": "title2",
            "id": "9a136351-e893-4be6-a931-1b6a5ce85031",
            "on": true
          }
        ],
        "is_collapsed": false
      },
      {
        "type": "remote",
        "title": "remote",
        "url": "www.remote.com",
        "id": "8d65f5a3-306d-44c7-a43f-b5abc17b6a2b",
        "on": true
      },
      {
        "type": "group",
        "title": "group",
        "id": "cbf8ea19-4474-4c15-8af0-3a4bdcdff717"
      },
      {
        "type": "local",
        "title": "local",
        "id": "751b26d0-5c94-4328-a0e8-23fdd85d160f"
      }
    ];

    return (
      <div className='list'>
        <Tree
          data={data}
          selected_ids={this.state.selected_ids}
          onChange={(list) => {
            // setShowList(list)
            // setList(list).catch((e) => console.error(e))
          }}
          onSelect={(ids: string[]) => {
            // console.log(ids);
            // setSelectedIds(ids);
            this.setState({
              selected_ids: ids || ['0']
            });
          }}
          onDoubleClick={this.onDoubleClick.bind(this)}
          nodeRender={(data) => (
            <ListItem key={data.id} data={data} /* selected_ids={selected_ids} */ />
          )}
          // collapseArrow={
          //   <Center w="20px" h="20px">
          //     <BiChevronRight />
          //   </Center>
          // }
          nodeAttr={(item) => {
            return {
              can_drag: true,
              can_drop_before: true,
              can_drop_in: item.type === 'folder',
              can_drop_after: true,
            }
          }}
          draggingNodeRender={(data) => {
            return (
              <div className={classnames(/* styles.for_drag */)}>
                <span className={classnames(/* styles.icon, data.type === 'folder' && styles.folder */)}>
                  <ItemIcon
                    type={data.type}
                    is_collapsed={data.is_collapsed}
                  />
                </span>
                {/* <span>
                  {data.title || lang.untitled}
                  {selected_ids.length > 1 ? (
                    <span className={styles.items_count}>
                      {selected_ids.length} {lang.items}
                    </span>
                  ) : null}
                </span> */}
              </div>
            )
          }}
          // nodeClassName={styles.node}
          // nodeDropInClassName={styles.node_drop_in}
          // nodeSelectedClassName={styles.node_selected}
          // nodeCollapseArrowClassName={styles.arrow}
          allowed_multiple_selection={true}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    list: state.app.list,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetList: (v: any) => dispatch(setList(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
