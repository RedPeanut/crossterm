import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { setScreen } from '../reducers/app';
import Split from './Split';
import SideBar from './sidebar/SideBar';
import SidePanel from './sidebar/SidePanel';
import BookmarkPanel from './panel/BookmarkPanel';
import Sample1Panel from './panel/Sample1Panel';
import Sample2Panel from './panel/Sample2Panel';
import Tabs from './tabs/Tabs';
import Sessions from './session/Sessions';

class Main extends React.Component {
  componentDidMount() {
    let self = this;
    window.addEventListener('resize', _.debounce(this.onResize.bind(this), 100/* , { leading: true } */));
    // this.onResize();
    // window.dispatchEvent(new Event('resize' /* , { bubbles: true } */));
  }

  onResize(e: Event) {
    console.log('onResize() is called...');
    const _window = e.target as Window;
    // console.log('_window =', _window);
    console.log('width =', _window.innerWidth);
    console.log('height =', _window.innerHeight);
    // if(this.props) {
    //   this.props.onSetScreen({
    //     width: _window.innerWidth,
    //     height: _window.innerHeight,
    //   });
    // }
  }

  render() {
    return (
      <div className="app">
        <Split className=""
          lineBar={true}
          visible={[1]}
          style={{}}
        >
          <div className="parts side">
            <SideBar />
            <SidePanel>
              <BookmarkPanel />
              <Sample1Panel />
              <Sample2Panel />
            </SidePanel>
          </div>
          <Split className="parts body"
            lineBar={true}
            visible={false}
            style={{
            }}
          >
            <Tabs />
            <Sessions />
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
  return {
    onSetScreen: (v: any) => dispatch(setScreen(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
