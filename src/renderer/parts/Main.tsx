import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import Split from './Split';
import SideBar from './sidebar/SideBar';
import SidePanel from './sidebar/SidePanel';
import BookmarkPanel from './panel/BookmarkPanel';
import Sample1Panel from './panel/Sample1Panel';
import Sample2Panel from './panel/Sample2Panel';
import Tabs from './tabs/Tabs';
import Sessions from './session/Sessions';
import { Terminal_, SplitItem, isTerminal, isSplitItem } from '../Types';
import { v4 as uuidv4 } from 'uuid';

import '../../../node_modules/xterm/css/xterm.css';
import Term from './terminal';

class Main extends React.Component {

  _onResize: (this: Window, ev: UIEvent) => any;

  constructor(props: any) {
    super(props);
    this._onResize = _.debounce(this.onResize.bind(this), 100/* , { leading: true } */);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);

    window.ipc.on('terminal data', (...args: any[]) => {
      console.log('terminal data event is called..');
      console.log('args =', args);
      const raw: string = args[1];
      const uid = raw.slice(0, 36);
      const data = raw.slice(36);
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
    let size = Math.floor(100 / list.length) + '%';
    for(let i = 0; i < list.length; i++) {
      if(Array.isArray(list[i])) {
        result.push(
          <div className="body-item"
            style={mode === 'vertical' ? { height: size } : { width: size }}
            key={uuidv4()}
          >
            <Tabs list={list[i] as Terminal_[]}/>
            <Sessions list={list[i] as Terminal_[]}/>
          </div>
        )
      } else if(isSplitItem(list[i])) {
        let item = list[i] as SplitItem;
        result.push(
          <Split className=""
            style={mode === 'vertical' ? { height: size } : { width: size }}
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

  render() {

    /* let root: SplitItem = {
      mode: 'horizontal',
      list: [
        [{id:'a1'},{id:'a2'}]
      ],
    } */

    let root: SplitItem = {
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
    };

    return (
      <div className="app">
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
            style={{
            }}
          >

            <Term />

            {/* { this.renderBodyItem(root.mode, root.list) } */}

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
