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
  connect: async (state: State, username: string) => {
    const connection = new Connection({
      endpoint: process.env.ENDPOINT || "ws://localhost:4000",
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
      let resolve = null;
      const p = new Promise(r => {
        resolve = r;
      });
      setTimeout(resolve, 1000);
      await p;
      const details = await connection.Open()
      connection.OnClose().then((closeInfo) => {
        store.setState({
          ...state,
          connState: EConnectionState.Disconnected,
        });
      });
      store.setState({
        ...state,
        connState: EConnectionState.Connected,
        username: details.authid || username,
        instanceid: (details.authextra || {})["containerid"] || null,
        connection: connection,
      });
    } catch (e) {
      store.setState({
        ...state,
        connState: EConnectionState.Error,
        errorMessage: `Server unreachable: ${e.toString()}`,
      });
    }
  },
  resetConn: (state: State) => {
    state.connection.Close();
    store.setState({
      ...state,
      connection: null,
      instanceid: null,
      username: null,
      connState: EConnectionState.Disconnected,
      errorMessage: null,
    });
  },
});
