import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import update, { Spec } from 'immutability-helper';
import { Center } from '@chakra-ui/react';
import { BiChevronRight } from 'react-icons/bi';
import { ListItem } from 'renderer/Types';
import { setList, setTree } from 'renderer/reducers/app';
import ItemIcon from 'renderer/parts/ItemIcon';
import ListItem_ from 'renderer/parts/list/ListItem_';
import Tree from 'renderer/parts/tree/Tree';
import { findActiveItem, flatten } from 'renderer/util';
import { TerminalItem } from 'common/Types';

interface ListProps {
  // mapped value
  list: any, onSetList: any;
  tree: any, onSetTree: any;
}

interface ListState {
  selected_ids: string[];
  show_list: ListItem[];
}

class List extends React.Component<ListProps, ListState> {

  constructor(props: ListProps) {
    super(props);
    this.state = {
      selected_ids: ['0'],
      show_list: [
        {
          type: 'folder',
          title: 'folder',
          id: '52528ee3-aa4f-44a5-b763-5cf69acacf51',
          children: [
            {
              id: 'e54af9c1-f003-4b1b-8db4-e796f69a9a4d',
              title: 'xyz',
              type: 'remote',
              url: {
                host: '192.168.0.25',
                port: 22,
                username: 'kimjk',
                password: '1234',
              },
              size: { row: 24, col: 80 }
            },
            {
              type: 'local',
              title: 'local',
              id: '96367ed9-6fb1-434b-b45d-de9d2d21898a',
            }
          ],
          'is_collapsed': false
        },
        {
          type: 'remote',
          title: 'remote',
          // url: 'www.remote.com',
          id: '8d65f5a3-306d-44c7-a43f-b5abc17b6a2b',
        },
        /* {
          type: 'group',
          title: 'group',
          id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
        }, */
        {
          type: 'local',
          title: 'local',
          id: '751b26d0-5c94-4328-a0e8-23fdd85d160f'
        }
      ]
    };
  }

  componentDidMount() {}

  onDoubleClick(id: string) {
    // insert terminal into active list
    const { tree } = this.props;
    const { show_list } = this.state;

    const item: ListItem | undefined = flatten(show_list).find((item) => item.id === id);

    if(!item) throw Error;

    const new_one: TerminalItem = {
      // type: item?.type, size: { row: 24, col: 80 },
      type: item.type, size: item.size , url: item.url,
      uid: uuidv4(), selected: true, active: true,
    };

    // find active item position first
    const find_active = findActiveItem(tree, 0, []);
    // console.log('find_active =', find_active);
    let new_tree;

    if(find_active) {

      const { depth, index, pos, item: activeItem } = find_active;

      // turn off active item
      activeItem.selected = false;
      activeItem.active = false;

      // make query language
      // https://github.com/kolodny/immutability-helper?tab=readme-ov-file#nested-collections
      // ex) new_tree = update(tree, { list: { [index]: { $splice: [[ pos+1, 0, new_one ]] } } });
      // const $splice: Spec<any, never> = [[ pos+1, 0, new_one ]];
      let $query: Spec<any, never> = { $splice: [[ pos+1, 0, new_one ]] };

      // attach backward
      for(let i = index.length-1; i > -1; i--) {
        $query = { list: { [index[i]]: $query }};
      }
      // console.log('tree =', tree);
      // console.log('$query =', JSON.stringify($query));
      new_tree = update(tree, $query);
    } else {
      new_tree = update(tree, { list: { $push: [ [new_one] ] } });
    }
    // console.log('new_tree =', new_tree);
    this.props.onSetTree(new_tree);
  }

  /* onDoubleClick(id: string) {
    // find active tabs -> add tab after selected one in here..
    const { list } = this.props;

    if(list && list.length > 0) {

      let exists = false;
      let i = 0, j = 0;
      outer: for(i = 0; i < list.length; i++) {
        for(j = 0; j < list[i].children.length; j++) {
          if(list[i].children[j].active) {
            exists = true;
            break outer;
          }
        }
      }
      console.log('exists =', exists);

      // i and j are selected after loop
      i = i > list.length-1 ? list.length-1 : i;
      j = j > list[i].children.length-1 ? list[i].children.length-1 : j;
      console.log('i =', i, ', j =', j);

      if(exists) {
        // turn off the selected item
        list[i].children[j].selected = false;
        list[i].children[j].active = false;
      } else {
        // if there is no is only first time
      }

      const new_one: FlatItem = {id:uuidv4(),selected:true,active:true};
      const replaced_children = [
        ...list[i].children,
        new_one
      ];
      const replaced_item = {
        ...list[i],
        children: replaced_children
      };
      const new_list = [
        ...list.slice(0, i),
        replaced_item,
        ...list.slice(i+1)
      ];
      console.log('new_list =', new_list);
      this.props.onSetList(new_list);
    }
  } */

  render() {
    const { show_list } = this.state;
    return (
      <div className='list'>
        <Tree
          data={show_list}
          selected_ids={this.state.selected_ids}
          onChange={(list) => {
            // setShowList(list)
            // setList(list).catch((e) => console.error(e))
            this.setState({
              ...this.state,
              show_list: list
            });
          }}
          onSelect={(ids: string[]) => {
            // console.log(ids);
            // setSelectedIds(ids);
            this.setState({
              selected_ids: ids || ['0']
            });
          }}
          nodeRender={(data) => (
            <ListItem_ key={data.id} data={data} /* selected_ids={selected_ids} */ />
          )}
          collapseArrow={
            <Center w="20px" h="20px">
              <BiChevronRight />
            </Center>
          }
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
              <div className={classnames('for_drag'/* styles.for_drag */)}>
                <span className={classnames('icon'/* styles.icon, data.type === 'folder' && styles.folder */)}>
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
          onDoubleClick={this.onDoubleClick.bind(this)}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    list: state.app.list,
    tree: state.app.tree,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetList: (v: any) => dispatch(setList(v)),
    onSetTree: (v: any) => dispatch(setTree(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
