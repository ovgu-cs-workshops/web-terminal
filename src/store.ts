import createStore, { Store } from 'unistore'
import devtools from 'unistore/devtools'
import { State, EConnectionState } from '@app/types'
import { Connection, BrowserWebSocketTransport, TicketAuthProvider } from '@verkehrsministerium/kraftfahrstrasse';
import { BrowserMSGPackSerializer } from '@verkehrsministerium/kraftfahrstrasse/build/module/serialize/BrowserMSGPack';

const initialState: State = {
  instanceid: null,
  username: null,
  connState: EConnectionState.Disconnected,
  connection: null,
  errorMessage: null,
};

export const store = process.env.NODE_ENV === 'production' ?
  createStore(initialState) : devtools(createStore(initialState))

export const actions = (store: Store<State>) => ({
  async connect (state: State, username: string) {
    const connection = new Connection({
      endpoint: "ws://localhost:4000",
      realm: "gittalk",
      serializer: new BrowserMSGPackSerializer(),
      transport: BrowserWebSocketTransport,
      authProvider: new TicketAuthProvider(username, async () => {
        return { signature: ""};
      }),
    });
    store.setState({
      ...state,
      connState: EConnectionState.Connecting,
    });
    try {
      const details = await connection.Open()
      connection.OnClose().then((closeInfo) => {
        store.setState({
          ...state,
          connState: EConnectionState.Error,
          errorMessage: `Connection to server lost: ${closeInfo.reason}`,
        });
      });
      store.setState({
        ...state,
        connState: EConnectionState.Connected,
        username: details.authid || username,
        instanceid: (details.authextra || {})["instanceid"] || null,
        connection: connection,
      });
    } catch (e) {
      store.setState({
        ...state,
        connState: EConnectionState.Error,
        errorMessage: `Failed to connect to server: ${e.toString()}`,
      });
    }
  },
});
