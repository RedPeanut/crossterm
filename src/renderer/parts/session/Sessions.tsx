import React from 'react';

import { Terminal_, SplitItem, isTerminal, isSplitItem } from '../../Types';
import DropOverlay from '../DropOverlay';
import DropTarget from '../DropTarget';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

interface SessionsProps {
  list: Terminal_[];
}

interface SessionsState {
}

export default class Sessions extends React.Component<SessionsProps, SessionsState> {

  uid: string;

  constructor(props: SessionsProps) {
    super(props)
    this.uid = uuidv4();
    this.state = {
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div id={this.uid}
        className='sessions-container'
      >
        <DropTarget uid={this.uid} />
        <DropOverlay uid={this.uid} list={this.props.list} />
      </div>
    );
  }
}
