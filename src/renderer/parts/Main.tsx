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

class Main extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', _.debounce(this.onResize.bind(this), 100/* , { leading: true } */));
  }

  onResize(e: Event) {
    console.log('onResize() is called...');
    const _window = e.target as Window;
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
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
