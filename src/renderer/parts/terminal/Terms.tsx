import React from 'react';
import { connect } from 'react-redux';
// import { setSomeVal } from '../../reducers/sample';
import { v4 as uuidv4 } from 'uuid';
// import { FlatItem, Terminal } from '../../Types';
import Term from './Term';
import Wrapper from '../drop/Wrapper';
import { TerminalItem } from 'common/Types';

interface TermsProps {
  // list: Terminal_[];
  // pid: string;
  // children: FlatItem[];
  group: TerminalItem[];
  groupId: string;

  // mapped value
  // dropOverlay: any;
}

interface TermsState {}

class Terms extends React.Component<TermsProps, TermsState> {

  terms_uid: string;
  termsRef: HTMLElement | null;
  resizeObserver!: ResizeObserver;
  resizeTimeout!: NodeJS.Timeout;

  constructor(props: TermsProps) {
    super(props);
    this.terms_uid = uuidv4();
    this.termsRef = null;
  }

  componentDidMount() {}

  onTermsRef(component: HTMLElement | null) {
    this.termsRef = component;

    if(component) {
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          // this.fitResize();
          // console.log('resize timeout is called...');
          // console.trace();
        }, 500);
      });
      this.resizeObserver.observe(component);
    } else {
      this.resizeObserver.disconnect();
    }
  };

  render() {
    // const { pid, children } = this.props;
    const { group, groupId } = this.props;

    return (
      <div
        ref={this.onTermsRef.bind(this)}
        className='terms'
      >
        {
          group.map((item, index) => {
            return (
              <Term groupId={groupId} group={group} item={item} key={uuidv4()}/>
            );
          })
        }
        <Wrapper groupId={groupId} group={group} terms_uid={this.terms_uid} />

        {/* {
          children.map((item, index) => {
            return (
              <Term item={item} key={uuidv4()}/>
            );
          })
        }
        <Wrapper uid={this.uid} pid={pid} children={children} /> */}

        {/* { dropOverlay.visible ?
          <div>
            <DropTarget uid={this.uid} />
            <DropOverlay uid={this.uid} children={children} />
          </div>
        : null } */}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    // dropOverlay: state.app.dropOverlay,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Terms);
