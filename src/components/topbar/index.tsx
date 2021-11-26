import { Button, ConnState, EConnectionState } from '@app/types';
import { Component, h } from 'preact';
import './index.scss';

export class ConnectButton extends Component<Button> {
  public render({ disabled, action }: Button) {
    return <button
      class='btn waves-effect waves-light'
      type='submit'
      name='connect'
      onClick={action}
      disabled={disabled}
    >
      <i class='material-icons left'>link</i> Connect
    </button>;
  }
}

export class TopBarComponent extends Component<ConnState, { user: string }> {
  public render({ connState, connect }: ConnState) {
    return <div class='hbox'>
      <div class='input-field'>
        <input onInput={e => this.setState({user: (e.target as any).value})} type='text' id='username'/>
        <label for='username'>Username</label>
      </div>
      <ConnectButton action={() =>
        connect(this.state.user)} disabled={connState !== EConnectionState.Disconnected || !this.state.user
      } />
    </div>;
  }
}
