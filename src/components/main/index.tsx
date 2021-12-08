
// tslint:disable: no-console
import { Component, h } from 'preact';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as WebfontLoader from 'xterm-webfont';

import { EConnectionState, MainConnState } from '@app/types';
import { Connection, ISubscription } from '@verkehrsministerium/kraftfahrstrasse';

import './index.scss';

export class TerminalComponent extends Component<{instance: string, connection: Connection, resetConn: () => void }, {
  term: Terminal,
  conn: Connection,
  decoder: any,
  encoder: any,
  id: string,
  outSub: ISubscription,
  exitSub: ISubscription,
  resizeFunc: () => void,
}> {
  public render() {
    return <div id='terminal'></div>;
  }

  public componentDidMount() {
    // Bootstrap the terminal
    const elem = document.querySelector('#terminal') as HTMLDivElement;
    const terminal = new Terminal({
      fontFamily: 'Hack',
      rendererType: 'dom',
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.loadAddon(new WebfontLoader());
    // Subscribe to the topics
    (async () => {
      await (terminal as any).loadWebfontAndOpen(elem);
      fit.fit();

      const resizeFunc = () => (terminal as any).fit();
      window.addEventListener('resize', resizeFunc);

      const id = Math.random().toString(36).substring(7);

      // Update the state
      this.setState({
        ...this.state,
        decoder: new (window as any).TextDecoder(),
        encoder: new (window as any).TextEncoder(),
        term: terminal,
        id,
        resizeFunc,
      });

      const baseUrl = `rocks.git.tui.${this.props.instance}.${id}`;
      const outSub = await this.props.connection.Subscribe(`${baseUrl}.out`, (a: [ArrayBuffer]) => {
        const data = this.state.decoder.decode(a[0], {stream: true});
        this.state.term.write(data);
      });
      const exitSub = await this.props.connection.Subscribe(`${baseUrl}.exit`, () => {
        console.log('CONSOLE_EXIT => RESET');
        this.props.resetConn();
      });
      this.setState({
        ...this.state,
        outSub,
        exitSub,
      });
      const height = this.state.term.rows;
      const width = this.state.term.cols;
      const args = [id, width - 2, height];
      await this.props.connection.Call(`rocks.git.tui.${this.props.instance}.create`, args)[0];
      this.state.term.onResize(({rows, cols}) => {
        this.props.connection.Call(`${baseUrl}.resize`, [cols - 2, rows])[0]
        .catch(err => console.log('Failed to resize tui:', err));
      });
      this.state.term.onData(data => {
        const d2 = this.state.encoder.encode(data);
        this.props.connection.Call(`${baseUrl}.input`, [d2.buffer])[0]
        .catch(err => console.log('Failed to send data to tui:', err));
      });
    })().catch(err => {
      console.log(err);
      terminal.clear();
      terminal.writeln('Failed to initialize server connection!');
      terminal.writeln(err);
      setTimeout(() => {
        this.props.resetConn();
      }, 3000);
    });
  }
  public componentWillUnmount() {
    (async () => {
      if (!!this.state.exitSub) {
        await this.state.exitSub.Unsubscribe();
      }
      if (!!this.state.outSub) {
        await this.state.outSub.Unsubscribe();
      }
      if (!!this.state.resizeFunc) {
        window.removeEventListener('resize', this.state.resizeFunc);
      }
    })().catch(err => console.log('Failed to unsubscribe from out/exit:', err));
    if (!!this.state.term) {
      this.state.term.dispose();
    }
  }
}

export class MainComponent extends Component<MainConnState> {
  public render({ connState, errorMessage, connection, instance, resetConn, message }: MainConnState) {
    switch (connState) {
      case EConnectionState.Disconnected:
      return <div class='message'>
        <span class='hw'><i class='material-icons'>arrow_upward</i></span>
        <span class='hw'>Choose a username and click 'connect'</span>
        </div>;
      case EConnectionState.Connecting:
        return <div class='message'>
          <div class='progress'>
            <div class='indeterminate'></div>
          </div>
          <span class='hw'><i class='material-icons'>link</i></span>
            {message.map(value => <span class='hw'>{value}</span>)};
        </div>;
      case EConnectionState.Connected:
        return <TerminalComponent connection={connection} instance={instance} resetConn={resetConn} />;
      case EConnectionState.Error:
        return <div class='message'>
          <span class='hw'><i class='material-icons'>clear</i></span>
          <span class='hw'>Failed to connect to server!</span>
          <span class='hw'>{errorMessage}</span>
          <span class='hw'>Reload the page and try again!</span>
        </div>;
    }
    return null;
  }
}
