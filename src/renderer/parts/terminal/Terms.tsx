import React from 'react';
import { connect } from 'react-redux';
// import { setSomeVal } from '../../reducers/sample';
import { v4 as uuidv4 } from 'uuid';
import { Terminal_, SplitItem, isTerminal_, isSplitItem } from '../../Types';
import DropOverlay from '../DropOverlay';
import DropTarget from '../DropTarget';
import Term from './Term';

interface TermsProps {
  list: Terminal_[];

  // mapped value
  dropOverlay: any;
}

interface TermsState {}

class Terms extends React.Component<TermsProps, TermsState> {

  uid: string;
  termsRef: HTMLElement | null;
  resizeObserver!: ResizeObserver;
  resizeTimeout!: NodeJS.Timeout;

  constructor(props: TermsProps) {
    super(props);
    this.uid = uuidv4();
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
    const { dropOverlay, list } = this.props;
    return (
      <div
        ref={this.onTermsRef.bind(this)}
        className='terms'
      >
        {
          list.map((item, index) => {
            return (
              <Term terminal={item} key={uuidv4()}/>
            );
          })
        }
        { dropOverlay.visible ?
          <div>
            <DropTarget uid={this.uid} />
            <DropOverlay uid={this.uid} list={list} />
          </div>
        : null }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    dropOverlay: state.app.dropOverlay,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Terms);
