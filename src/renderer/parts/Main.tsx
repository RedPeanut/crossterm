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
import Sessions from './session/Sessions';
import { Terminal_, SplitItem, isTerminal_, isSplitItem } from '../Types';
import { v4 as uuidv4 } from 'uuid';

// import 'xterm/css/xterm.css';
// import Term from './terminal/Term';
import terminals from './terminal/terminals';
import Terms from './terminal/Terms';

class Main extends React.Component {

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

  // render item recursively
  renderBodyItem(mode: string, list: (SplitItem | Terminal_[])[]): JSX.Element[] {
    let result = []; // (<></>);
    const sizeProperty = mode === 'vertical' ? 'height' : 'width';
    let size = Math.floor(100 / list.length) + '%';
    // maybe split-bar's flex-shrink: 0
    // let n_divider = list.length - 1;
    // let size = `calc((100% - ${n_divider} * 3px) / ${list.length})`;
    const style = {
      [sizeProperty]: size,
    };
    for(let i = 0; i < list.length; i++) {
      if(Array.isArray(list[i])) {
        result.push(
          <div className="body-item"
            style={style}
            key={uuidv4()}
          >
            <Tabs list={list[i] as Terminal_[]}/>
            <Terms list={list[i] as Terminal_[]}/>
          </div>
        )
      } else if(isSplitItem(list[i])) {
        let item = list[i] as SplitItem;
        result.push(
          <Split className=""
            style={style}
            lineBar={true}
            mode={item.mode}
            key={uuidv4()}
          >
            { this.renderBodyItem(item.mode, item.list) }
          </Split>
        )
      }
    }
    return result;
  }

  selectLastItemIfNone(list: (SplitItem | Terminal_[])[]) {
    for(let i = 0; i < list.length; i++) {
      if(Array.isArray(list[i])) {
        let selected: boolean | undefined = false,
          active: boolean | undefined = false;
        let _list = list[i] as Terminal_[];
        for(let j = 0; j < _list.length; j++) {
          selected ||= _list[j].selected;
          active ||= _list[j].active;
        }
        if(!selected/*  && !active */) {
          _list[_list.length-1].selected = true;
          // _list[_list.length-1].active = true;
        }
      } else if(isSplitItem(list[i])) {
        let item = list[i] as SplitItem;
        this.selectLastItemIfNone(item.list);
      }
    }
  }

  render() {

    let root: SplitItem = {
      mode: 'vertical',
      list: [
        [{id:'a1',selected:true,active:true},{id:'a2'}],
        [{id:'b1'}]
      ],
    }

    this.selectLastItemIfNone(root.list);
    // console.log('root.list =', root.list);

    /* let root: SplitItem = {
      mode: 'horizontal',
      list: [
        {
          mode: 'vertical',
          list: [
            [{id:'a1'},{id:'a2'}],
            [{id:'b'}]
          ]
        },
        [{id:'c1'},{id:'c2'},{id:'c3'}]
      ]
    }; */

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
            <Split className="parts body"
              lineBar={true}
              // visible={false}
              style={{}}
              mode={root.mode}
            >

              {/* <Term /> */}

              { this.renderBodyItem(root.mode, root.list) }

              {/* <Split className=""
                style={{width:'50%'}}
                lineBar={true}
                mode="vertical"
              >
                <div className="body-item"
                  style={{
                    height:'50%'
                  }}
                >
                  <Tabs />
                  <Sessions />
                </div>
                <div className="body-item"
                  style={{
                    height:'50%'
                  }}
                >
                  <Tabs />
                  <Sessions />
                </div>
              </Split>
              <div className="body-item"
                style={{width:'50%'}}
              >
                <Tabs />
                <Sessions />
              </div> */}

            </Split>
          </Split>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
