import React from 'react';
import { connect } from 'react-redux';
import { Terminal } from 'xterm'
import { WebLinksAddon } from 'xterm-addon-web-links';

interface TermProps {}
interface TermState {}

class Term extends React.Component<TermProps, TermState> {

  public static defaultProps = {};

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    /* let returnValue =  */window.ipc.send('new', { type: 'local', size: { col: 80, row: 24 } });
    // console.log('[app] returnValue =', returnValue);

    const terminal = new Terminal();
    // Load WebLinksAddon on terminal, this is all that's needed to get web links
    // working in the terminal.
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(document.getElementById('a') as HTMLElement);
  }

  render() {
    return (
      <div id="a">
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
