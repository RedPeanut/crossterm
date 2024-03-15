import React from 'react';

import { Terminal, SplitItem, isTerminal, isSplitItem } from '../../Types';
import DropOverlay from '../DropOverlay';
import DropTarget from '../DropTarget';
import _ from 'lodash';
import { v1 as uuid } from 'uuid';

interface SessionsProps {
  list: Terminal[];
}

interface SessionsState {
}

export default class Sessions extends React.Component<SessionsProps, SessionsState> {

  uuid: string;

  constructor(props: SessionsProps) {
    super(props)
    this.uuid = uuid();
    this.state = {
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div id={this.uuid}
        className='sessions-container'
      >
        <DropTarget uuid={this.uuid} />
        <DropOverlay uuid={this.uuid} list={this.props.list} />
      </div>
    );
  }
}
