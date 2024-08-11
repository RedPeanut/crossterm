import React from 'react';
import { connect } from 'react-redux';
import 'xterm/css/xterm.css';
import { Terminal as xterm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { v4 as uuidv4 } from 'uuid';
import classnames from 'classnames';
import { terminals } from '../../globals';
// import { FlatItem, Terminal } from '../../Types';
import { TerminalItem } from 'common/Types';

interface TermProps {
  // uid: string;
  // terminal: Terminal_;
  // item: FlatItem;
  group: TerminalItem[];
  groupId: string;
  item: TerminalItem;
  style?: {};
}

interface TermState {}

class Term extends React.Component<TermProps, TermState> {

  xterm: xterm | null = null;
  uid: string;
  fitAddon: FitAddon;

  constructor(props: any) {
    super(props);
    this.uid = uuidv4();
    this.fitAddon = new FitAddon();
  }

  onKey(e: { key: string; domEvent: KeyboardEvent }) {
    const printable: boolean = !e.domEvent.altKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
  }

  onData(data: string) {
    // console.log('onData() is called..., e =', data);
    window.ipc.send('data', {
      uid: this.uid,
      data: data
    });
  }

  componentDidMount() {
    // let returnValue = window.electron.api.send('api:createTerminal', { type: 'local', size: { col: 80, row: 24 } });
    // console.log('[app] returnValue =', returnValue);

    const { item } = this.props;
    // console.log('item =', item);
    // if(item.type === null || item.type === undefined) item.type = 'local';
    item.type = item.type ?? 'local';

    let returnValue = window.ipc.send('new', {
      ...item,
      uid: this.uid,
      // type: 'local',
      // size: { col: 80, row: 24 },
      // url: { protocol: '', user: '', resource: '', port: '' }
    });
    // console.log('[app] returnValue =', returnValue);

    const _xterm = new xterm({});
    // Load WebLinksAddon on terminal, this is all that's needed to get web links
    // working in the terminal.
    _xterm.loadAddon(new WebLinksAddon());
    _xterm.loadAddon(this.fitAddon);
    _xterm.open(document.getElementById(this.uid) as HTMLElement);
    _xterm.onKey((e) => this.onKey(e));
    _xterm.onData((e) => this.onData(e));
    this.fitAddon.fit();
    this.xterm = _xterm;

    terminals[this.uid] = this;
  }

  componentWillUnmount() {
    terminals[this.uid] = null;
  }

  render() {

    const { item } = this.props;

    let style = {};
    if(!item.selected) {
      style = {display: 'none'}
    }

    return (
      <div id={this.uid}
        className={classnames('term', item.selected ? 'selected' : null, item.active ? 'active' : null)}
        style={style}
      />
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
