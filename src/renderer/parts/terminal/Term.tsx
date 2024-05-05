import React from 'react';
import { connect } from 'react-redux';
import { Terminal as xterm } from 'xterm'
import { WebLinksAddon } from 'xterm-addon-web-links';
import terminals from './terminals';
import { v4 as uuidv4 } from 'uuid';

interface TermProps {
  // uid: string;
}

interface TermState {}

class Term extends React.Component<TermProps, TermState> {

  public static defaultProps = {};

  terminal: xterm | null = null;
  uid: string;

  constructor(props: any) {
    super(props);
    this.uid = uuidv4();
  }

  onKey(e: { key: string; domEvent: KeyboardEvent }) {
    const printable: boolean = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;

  }

  onData(data: string) {
    console.log('onData() is called..., e =', data);
    window.ipc.send('data', {
      uid: this.uid,
      data: data
    });
  }

  componentDidMount() {
    // let returnValue = window.electron.api.send('api:createTerminal', { type: 'local', size: { col: 80, row: 24 } });
    // console.log('[app] returnValue =', returnValue);
    let returnValue = window.ipc.send('new', {
      uid: this.uid,
      type: 'local',
      size: { col: 80, row: 24 },
      url: { protocol: '', user: '', resource: '', port: '' }
    });
    // console.log('[app] returnValue =', returnValue);

    const terminal = new xterm({});
    // Load WebLinksAddon on terminal, this is all that's needed to get web links
    // working in the terminal.
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(document.getElementById(this.uid) as HTMLElement);
    terminal.onKey((e) => this.onKey(e));
    terminal.onData((e) => this.onData(e));
    this.terminal = terminal;

    terminals[this.uid] = this;
  }

  componentWillUnmount() {
    terminals[this.uid] = null;
  }

  render() {
    return (
      <div id={this.uid}>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Term);
