import { Component, h } from 'preact';
import { Terminal } from 'xterm';
import { MainConnState, EConnectionState } from '@app/types';
import './index.scss';

export class TerminalComponent extends Component<{}, {term: Terminal}> {
  render () {
    return <div id="terminal"></div>
  }

  componentDidMount() {
    const elem = document.querySelector('#terminal') as HTMLDivElement;
    const terminal = new Terminal();
    terminal.open(elem);
    this.setState({term: terminal});
  }
  componentWillUnmount() {
    this.state.term.destroy();
  }
}

export class MainComponent extends Component<MainConnState> {
  render({ connState, errorMessage }: MainConnState) {
    switch (connState) {
      case EConnectionState.Disconnected:
      return <div class="message">
        <span class="hw"><i class="material-icons">arrow_upward</i></span>
        <span class="hw">Choose a username and click 'connect'</span>
        </div>
      case EConnectionState.Connecting:
        return <div class="message">
          <span class="hw"><i class="material-icons">link</i></span>
          <span class="hw">Connecting to server...</span>
          <div class="progress">
            <div class="indeterminate"></div>
          </div>
        </div>
      case EConnectionState.Connected:
        return <TerminalComponent />
      case EConnectionState.Error:
        return <div class="message">
          <span class="hw"><i class="material-icons">clear</i></span>
          <span class="hw">Failed to connect to server!</span>
          <span class="hw">{errorMessage}</span>
          <span class="hw">Reload the page and try again!</span>
        </div>
    }
    return null;
  }
}
