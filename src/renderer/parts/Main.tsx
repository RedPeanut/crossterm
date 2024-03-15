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
import { Terminal, SplitItem, isTerminal, isSplitItem } from '../Types';

class Main extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize.bind(this), 100/* , { leading: true } */));
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
  renderBodyItem(mode: string, list: (SplitItem | Terminal[])[]): JSX.Element[] {
    let result = []; // (<></>);
    let size = Math.floor(100 / list.length) + '%';
    for(let i = 0; i < list.length; i++) {
      if(Array.isArray(list[i])) {
        result.push(
          <div className="body-item"
            style={mode === 'vertical' ? { height: size } : { width: size }}
          >
            <Tabs />
            <Sessions list={list[i] as Terminal[]}/>
          </div>
        )
      } else if(isSplitItem(list[i])) {
        let item = list[i] as SplitItem;
        result.push(
          <Split className=""
            style={mode === 'vertical' ? { height: size } : { width: size }}
            lineBar={true}
            mode={item.mode}
          >
            { this.renderBodyItem(item.mode, item.list) }
          </Split>
        )
      }
    }
    return result;
  }

  render() {

    let root: SplitItem = {
      mode: 'horizontal',
      list: [
        [{id:'a1'},{id:'a2'}]
      ],
    }

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
