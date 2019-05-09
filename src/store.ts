import createStore, { Store } from 'unistore'
import devtools from 'unistore/devtools'
import { State, EConnectionState } from '@app/types'
import { Connection, BrowserWebSocketTransport, TicketAuthProvider, WampDict } from '@verkehrsministerium/kraftfahrstrasse';
import { BrowserMSGPackSerializer } from '@verkehrsministerium/kraftfahrstrasse/build/module/serialize/BrowserMSGPack';

const initialState: State = {
  instanceid: null,
  username: null,
  connState: EConnectionState.Disconnected,
  connection: null,
  message: [],
  errorMessage: null,
};

export const store = process.env.NODE_ENV === 'production' ?
  createStore(initialState) : devtools(createStore(initialState))

export const actions = (store: Store<State>) => ({
  connect: async (state: State, username: string) => {
    const connection = new Connection({
      endpoint: "wss://api.workshop.pattig.rocks",
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
      message: ['Connecting to server...'],
    });
    try {
      const details = await connection.Open()
      connection.OnClose().then((closeInfo) => {
        store.setState({
          ...store.getState(),
          connState: EConnectionState.Disconnected,
        });
      });
      const instanceId = (details.authextra || {})["containerid"] || null;
      const ready = (details.authextra || {})["ready"] || false;
      store.setState({
        ...store.getState(),
        connState: ready ? EConnectionState.Connected : EConnectionState.Connecting,
        username: details.authid || username,
        instanceid: instanceId,
        connection: connection,
        message: [...store.getState().message, 'Reserving some storage...'],
      });
      await connection.Subscribe<[string], WampDict>(`rocks.git.${instanceId}.state`, ([stateMessage]) => {
        console.log('got state message', stateMessage);
        const oldState = store.getState();
        switch (stateMessage) {
          case 'pvcbound': {
            store.setState({
              ...oldState,
              message: [...oldState.message, 'Spinning up your container...'],
            });
            break;
          }
          case 'podrunning': {
            store.setState({
              ...oldState,
              message: [...oldState.message, 'Initializing some beautiful examples...'],
            });
            break;
          }
          case 'ready': {
            store.setState({
              ...oldState,
              message: [],
              connState: EConnectionState.Connected,
            });
            break;
          }
          default: {
            store.setState({
              ...oldState,
              message: [...oldState.message, stateMessage],
            });
            break;
          }
        }
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
      message: null,
    });
  },
});
