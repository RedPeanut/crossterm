// import {
//   BookOutlined,
//   ClockCircleOutlined,
//   CloudSyncOutlined,
//   InfoCircleOutlined,
//   PictureOutlined,
//   PlusCircleOutlined,
//   SettingOutlined,
//   UpCircleOutlined,
//   BarsOutlined,
// } from '@ant-design/icons';

import React from 'react';
import { connect } from 'react-redux';

import { setSidePanel } from '../../reducers/app';
import SideIcon from './SideIcon';
import SidePanel from './SidePanel';
import BookmarkPanel from '../panel/BookmarkPanel';
// import '../../../../release/app/node_modules/@vscode/codicons/dist/codicon.css';
// import '@vscode/codicons/dist/codicon.css';
// import { VscBookmark, VscInfo } from 'react-icons/vsc';
import { BiBookmarks, BiInfoCircle } from 'react-icons/bi';

import {
  DEFAULT_SIDE_BAR_WIDTH,
  // DEFAULT_SIDE_PANEL_WIDTH,
} from '../../Constants';

interface SideBarProps {
  sidePanel: { active: string, visible: boolean };
  onSetSidePanel: Function;
}

class SideBar extends React.Component<SideBarProps, {}> {
  componentDidMount() {}

  onClick = (next: string) => {
    const { sidePanel } = this.props;
    // console.log('sidePanel.active =', sidePanel.active);
    // console.log('next =', next);
    if(sidePanel.active.toLowerCase() === next.toLowerCase()) {
      this.props.onSetSidePanel({ ...sidePanel, visible: !sidePanel.visible }); // toggle panel
    } else {
      this.props.onSetSidePanel({ ...sidePanel, visible: true, active: next }); // open panel
    }
  };

  onClickBookmark = () => {};

  render() {
    // const { screen } = this.props;
    return (
      <div
        className="parts side-bar"
        style={{
          // width: DEFAULT_SIDE_BAR_WIDTH,
          // height: screen.height,
        }}
      >
        <div className="content">
          <div className="composite-bar">
            <SideIcon title="Bookmarks"
              onClick={() => this.onClick('Bookmarks')}
            >
              {/* <BookOutlined rev={null}
                className="font20 iblock control-icon"
                onClick={() => this.onClick('Bookmarks')} /> */}
              {/* <i className="codicon codicon-bookmark"
                onClick={() => this.onClick('Bookmarks')}
              ></i> */}
              <BiBookmarks
                size={24}
                // className=''
                // style={width:'32px',height:'32px'}
                // width={32} height={32}
                // onClick={() => this.onClick('Bookmarks')}
              />
            </SideIcon>
            <SideIcon title="Sample1"
              onClick={() => this.onClick('Sample1')}
            >
              {/* <InfoCircleOutlined rev={null}
                className="iblock font16 control-icon open-about-icon"
                onClick={() => this.onClick('Sample1')}
              /> */}
              {/* <i className="codicon codicon-info"
                onClick={() => this.onClick('Sample1')}
              ></i> */}
              <BiInfoCircle
                size={24}
                // width={32} height={32}
                // onClick={() => this.onClick('Sample1')}
              />
            </SideIcon>
            <SideIcon title="Sample2"
              onClick={() => this.onClick('Sample2')}
            >
              {/* <InfoCircleOutlined rev={null}
                className="iblock font16 control-icon open-about-icon"
                onClick={() => this.onClick('Sample2')}
              /> */}
              {/* <i className="codicon codicon-info"
                onClick={() => this.onClick('Sample2')}
              ></i> */}
              <BiInfoCircle
                size={24}
                // width={32} height={32}
                // onClick={() => this.onClick('Sample2')}
              />
            </SideIcon>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    screen: state.app.screen,
    sidePanel: state.app.sidePanel,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetSidePanel: (v: any) => dispatch(setSidePanel(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
