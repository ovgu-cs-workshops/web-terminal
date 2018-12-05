import { Component, h } from 'preact';
import { Terminal } from 'xterm';
import { Connection, ISubscription } from '@verkehrsministerium/kraftfahrstrasse';
import { MainConnState, EConnectionState } from '@app/types';
import * as WebfontLoader from 'xterm-webfont';

Terminal.applyAddon(WebfontLoader);

import './index.scss';

export class TerminalComponent extends Component<{instance: string, connection: Connection, resetConn: () => void }, {
  term: Terminal,
  conn: Connection,
  decoder: any,
  encoder: any,
  id: string,
  outSub: ISubscription,
  exitSub: ISubscription,
}> {
  render () {
    return <div id="terminal"></div>
  }

  componentDidMount() {
    // Bootstrap the terminal
    const elem = document.querySelector('#terminal') as HTMLDivElement;
    const terminal = new Terminal({
      fontFamily: 'Hack',
      rendererType: 'dom',
    });

    // Subscribe to the topics
    (async () => {
      await (terminal as any).loadWebfontAndOpen(elem);
      (terminal as any).fit();

      // Update the state
      this.setState({
        ...this.state,
        decoder: new (window as any).TextDecoder(),
        encoder: new (window as any).TextEncoder(),
        id: Math.random().toString(36).substring(7),
        term: terminal,
      });

      const baseUrl = `rocks.git.tui.${this.props.instance}.${this.state.id}.`;
      const outSub = await this.props.connection.Subscribe(baseUrl+'out', (a: [ArrayBuffer]) => {
        const data = this.state.decoder.decode(a[0], {stream: true});
        this.state.term.write(data);
      });
      const exitSub = await this.props.connection.Subscribe(baseUrl+'exit', () => {
        this.props.resetConn();
      });
      this.setState({
        ...this.state,
        outSub,
        exitSub,
      });
      const height = this.state.term.rows;
      const width = this.state.term.cols;
      await this.props.connection.Call(`rocks.git.tui.${this.props.instance}.create`, [this.state.id, width, height])[0];
      this.state.term.on('resize', ({rows, cols}) => {
        this.props.connection.Call(`rocks.git.tui.${this.props.instance}.${this.state.id}.resize`, [cols, rows])[0].catch(err => console.log('Failed to resize tui:', err));
      });
      this.state.term.on('data', (data) => {
        data = this.state.encoder.encode(data);
        this.props.connection.Call(`rocks.git.tui.${this.props.instance}.${this.state.id}.input`, [data.buffer])[0].catch(err => console.log('Failed to send data to tui:', err));
      });
    })().catch(err => {
      terminal.clear();
      terminal.writeln('Failed to initialize server connection!');
      terminal.writeln(err);
      setTimeout(() => {
        this.props.resetConn();
      }, 3000);
    });
  }
  componentWillUnmount() {
    (async () => {
      if (!!this.state.exitSub) {
        await this.state.exitSub.Unsubscribe();
      }
      if (!!this.state.outSub) {
        await this.state.outSub.Unsubscribe();
      }
    })().catch((err) => {
      console.log('Failed to unsubscribe from out/exit:', err);
    });
    if (!!this.state.term) {
      this.state.term.destroy();
    }
  }
}

export class MainComponent extends Component<MainConnState> {
  render({ connState, errorMessage, connection, instance, resetConn }: MainConnState) {
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
        return <TerminalComponent connection={connection} instance={instance} resetConn={resetConn} />
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
