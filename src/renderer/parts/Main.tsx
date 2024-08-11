import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import TopBar from './topbar/TopBar';
import Split from './Split';
import SideBar from './sidebar/SideBar';
import SidePanel from './sidebar/SidePanel';
import BookmarkPanel from './panel/BookmarkPanel';
import Sample1Panel from './panel/Sample1Panel';
import Sample2Panel from './panel/Sample2Panel';
import Tabs from './tabs/Tabs';
import { SplitItem, isSplitItem } from '../Types';
import { v4 as uuidv4 } from 'uuid';

// import 'xterm/css/xterm.css';
// import Term from './terminal/Term';
import { terminals } from '../globals';
import Terms from './terminal/Terms';
import Add from './Add';
import { TerminalItem } from 'common/Types';

interface Props {
  // mapped value
  list: any; tree:any; add: any;
}
interface State {}

class Main extends React.Component<Props, State> {

  _onResize: (this: Window, ev: UIEvent) => any;

  constructor(props: any) {
    super(props);
    this._onResize = _.debounce(this.onResize.bind(this), 100/* , { leading: true } */);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);

    window.ipc.on('terminal data', (...args: any[]) => {
      // console.log('terminal data event is called..');
      // console.log('args =', args);
      const raw: string = args[1];
      const uid = raw.slice(0, 36);
      const data = raw.slice(36);
      const term = terminals[uid];
      if(term) {
        term.xterm.write(data);
      }
    });

  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this._onResize);
  }

  onResize(e: Event) {
    // console.log('onResize() is called...');
    const _window = e.target as Window;
    // console.log('width =', _window.innerWidth);
    // console.log('height =', _window.innerHeight);
    // if(this.props) {
    //   this.props.onSetScreen({
    //     width: _window.innerWidth,
    //     height: _window.innerHeight,
    //   });
    // }
  }

  // // render item recursively
  // renderBodyItem(mode: string, list: (SplitItem | Terminal_[])[]): JSX.Element[] {
  //   let result = []; // (<></>);
  //   const sizeProperty = mode === 'vertical' ? 'height' : 'width';
  //   let size = Math.floor(100 / list.length) + '%';
  //   // maybe split-bar's flex-shrink: 0
  //   // let n_divider = list.length - 1;
  //   // let size = `calc((100% - ${n_divider} * 3px) / ${list.length})`;
  //   const style = {
  //     [sizeProperty]: size,
  //   };
  //   for(let i = 0; i < list.length; i++) {
  //     if(Array.isArray(list[i])) {
  //       result.push(
  //         <div className="body-item"
  //           style={style}
  //           key={uuidv4()}
  //         >
  //           <Tabs list={list[i] as Terminal_[]}/>
  //           <Terms list={list[i] as Terminal_[]}/>
  //         </div>
  //       )
  //     } else if(isSplitItem(list[i])) {
  //       let item = list[i] as SplitItem;
  //       result.push(
  //         <Split className=""
  //           style={style}
  //           lineBar={true}
  //           mode={item.mode}
  //           key={uuidv4()}
  //         >
  //           { this.renderBodyItem(item.mode, item.list) }
  //         </Split>
  //       )
  //     }
  //   }
  //   return result;
  // }

  // selectLastItemIfNone(list: (SplitItem | Terminal_[])[]) {
  //   for(let i = 0; i < list.length; i++) {
  //     if(Array.isArray(list[i])) {
  //       let selected: boolean | undefined = false; //,
  //         // active: boolean | undefined = false;
  //       let _list = list[i] as Terminal_[];
  //       for(let j = 0; j < _list.length; j++) {
  //         selected ||= _list[j].selected;
  //         // active ||= _list[j].active;
  //       }
  //       if(!selected/*  && !active */) {
  //         _list[_list.length-1].selected = true;
  //         // _list[_list.length-1].active = true;
  //       }
  //     } else if(isSplitItem(list[i])) {
  //       let item = list[i] as SplitItem;
  //       this.selectLastItemIfNone(item.list);
  //     }
  //   }
  // }

  // findActiveItem(list: (SplitItem | Terminal_[])[]): Terminal_ | undefined {
  //   for(let i = 0; i < list.length; i++) {
  //     if(Array.isArray(list[i])) {
  //       let _list = list[i] as Terminal_[];
  //       for(let j = 0; j < _list.length; j++) {
  //         if(_list[j].active)
  //           return _list[j];
  //       }
  //     } else if(isSplitItem(list[i])) {
  //       let item = list[i] as SplitItem;
  //       return this.findActiveItem(item.list);
  //     }
  //   }
  // }

  // findLastItem(list: (SplitItem | Terminal_[])[]): Terminal_ | undefined {
  //   for(let i = list.length-1; i > 0; i--) {
  //     if(Array.isArray(list[i])) {
  //       let _list = list[i] as Terminal_[];
  //       return _list[_list.length-1];
  //     } else if(isSplitItem(list[i])) {
  //       let item = list[i] as SplitItem;
  //       return this.findLastItem(item.list);
  //     }
  //   }
  // }

  /* renderBodyListItem(list: FlatItem[]): JSX.Element[] {
    let result = [];
    for(let i = 0; i < list.length; i++) {
      let item = list[i];
      if(isSplitItem_(list[i])) {
        result.push(
          <Split className=""
            // style={style}
            lineBar={true}
            mode={item.mode}
            key={uuidv4()}
          >
            { item.children && this.renderBodyListItem(item.children) }
          </Split>
        )
      } else {
        item.children && result.push(
          <div className='body-item' key={uuidv4()}>
            <Tabs children={item.children} />
            <Terms children={item.children} />
          </div>
        );
      }
    }
    return result;
  } */

  renderTreeList(parent: SplitItem, depth: number): JSX.Element[] {
    let result = [];
    for(let i = 0; i < parent.list.length; i++) {
      let item = parent.list[i];

      let className = '';
      let style;
      if(parent.list) {
        const sizeProperty = parent.mode === 'vertical' ? 'height' : 'width';
        const size = Math.floor(100 / parent.list.length) + '%';
        style = {[sizeProperty]: size};
      }

      if(isSplitItem(item)) {
        item = item as SplitItem;
        result.push(
          <Split className={className}
            style={style}
            lineBar={true}
            mode={item.mode}
            key={uuidv4()}
          >
            { this.renderTreeList(item as SplitItem, depth+1) }
          </Split>
        );
      } else {
        // if not split item must have one item (as Terminal[])
        let key, groupId = key = uuidv4();
        result.push(
          <div className='body-item' style={style} key={key}>
            <Tabs groupId={groupId} group={item as TerminalItem[]} />
            <Terms groupId={groupId} group={item as TerminalItem[]} />
          </div>
        );
      }
    }
    return result;
  }

  renderTreeRoot(root: SplitItem, depth: number): JSX.Element[] {
    let result = [];
    // let className = 'parts body';
    let style;

    if(isSplitItem(root)) {
      result.push(
        <Split className={'parts body'}
          style={style}
          lineBar={true}
          mode={root.mode}
          key={uuidv4()}
        >
          { this.renderTreeList(root as SplitItem, depth+1) }
        </Split>
      )
    } else {
      result.push(
        <div className='parts body' key={uuidv4()}>
          { this.renderTreeList(root as SplitItem, depth+1) }
        </div>
      )
    }
    return result;
  }

  /* renderBodyListItem(curr: FlatItem, depth: number, list: FlatItem[], idx: number, length: number): JSX.Element[] {
    let result = [];
    let className = depth === 0 ? 'parts body' : '';
    for(let i = idx; i < length; i++) {
      let item = list[i];

      let style;
      if(curr.children) {
        const sizeProperty = curr.mode === 'vertical' ? 'height' : 'width';
        const size = Math.floor(100 / curr.children.length) + '%';
        style = depth !== 0 ? {[sizeProperty]: size} : {};
      }

      if(isSplitItem_(item)) {
        // find children item from all
        if(item.children) {
          result.push(
            <Split className={className}
              style={style}
              lineBar={true}
              mode={item.mode}
              key={uuidv4()}
            >
              { this.renderBodyListItem(item, depth+1, list, i+1, item.children.length) }
            </Split>
          )
          break;
        } else
          throw new Error('blarblarbalr..');
      } else {
        if(item.children) {
          result.push(
            <div className='body-item' style={style} key={uuidv4()}>
              <Tabs pid={item.id} children={item.children} />
              <Terms pid={item.id} children={item.children} />
            </div>
          );
        }
      }
    }
    return result;
  } */

  render() {

    // const root: SplitItem = {
    //   mode: 'vertical',
    //   list: [
    //     [{id:'a1',selected:true/* ,active:true */},{id:'a2'}],
    //     [{id:'b1'}]
    //   ],
    // }

    // const root: SplitItem = {
    //   mode: 'horizontal',
    //   list: [
    //     {
    //       mode: 'vertical',
    //       list: [
    //         [{id:'a1'},{id:'a2'}],
    //         [{id:'b1'}]
    //       ]
    //     },
    //     [{id:'c1'},{id:'c2'},{id:'c3'}]
    //   ]
    // };

    // this.selectLastItemIfNone(root.list);
    // if(!this.findActiveItem(root.list)) {
    //   let lastItem = this.findLastItem(root.list);
    //   if(lastItem) lastItem.active = true;
    // }
    // console.log('root.list =', root.list);

    /* FlatItem Example: 이렇게 꾸며야 REACT가 상태변화를 감지할 것 같음
    [
      {id:'p1',mode:'horizontal',children:[{id:'q1'},{id:'q2'}]},
      {id:'q1',pid:'p1',mode:'vertical',children:[{id:'r1'},{id:'r2'}]},
      {id:'r1',pid:'q1',children:[{id:'s1'},{id:'s2'}]},
      // {id:'s1',pid:'r1', details in here?},
      // {id:'s2',pid:'r1'},
      {id:'r2',pid:'q1',children:[{id:'t1'}]},
      // {id:'t1',pid:'r2'},
      {id:'q2',pid:'p1',children:[{id:'u1'},{id:'u2'},{id:'u3'}]},
      // {id:'u1',pid:'q2'},
      // {id:'u2',pid:'q2'},
      // {id:'u3',pid:'q2'},
    ]

    [
      {id:'0',children:[{id:'q1'},{id:'q2'},{id:'q3'}]},
      // {id:'q1',pid:'0'},
      // {id:'q2',pid:'0'},
      // {id:'q3',pid:'0'},
    ]
    */

    // console.log('render() is called..');
    const { tree, list, add } = this.props;
    // console.log('tree =', tree);

    return (
      <div className="app">
        <TopBar />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          // flexGrow: '1'
          height: 'calc(100% - 42px)'
        }}>
          <Split className=""
            lineBar={true}
            visible={[1]}
            style={{width:'100%'}}
          >
            <SideBar />
            <SidePanel>
              <BookmarkPanel />
              <Sample1Panel />
              <Sample2Panel />
            </SidePanel>

            {/* { list.length === 1 ?
              <div className='parts body' style={style} key={uuidv4()}>
                <Tabs pid={item.id} children={item.children} />
                <Terms pid={item.id} children={item.children} />
              </div>
              : this.renderBodyListItem(list[0], 0, list, 0, list.length)
            } */}

            { this.renderTreeRoot(tree, 0) }

          </Split>
        </div>
        { add ? <Add/> : null }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    list: state.app.list,
    tree: state.app.tree,
    add: state.app.add,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
