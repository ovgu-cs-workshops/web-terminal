import createStore, { Store } from 'unistore';
import devtools from 'unistore/devtools';

import { EConnectionState, State } from '@app/types';
import {
  BrowserMSGPackSerializer,
  BrowserWebSocketTransport,
  Connection,
  TicketAuthProvider,
  WampDict,
} from '@verkehrsministerium/kraftfahrstrasse';

const initialState: State = {
  instanceid: null,
  username: null,
  connState: EConnectionState.Disconnected,
  connection: null,
  message: [],
  errorMessage: null,
};

export const store = process.env.NODE_ENV === 'production' ?
  createStore(initialState) : devtools(createStore(initialState));

export const actions = (localStore: Store<State>) => ({
  connect: async (state: State, username: string) => {
    const cfg = await fetch('/config.json?id=' + Date.now()).then(resp => resp.json());
    const connection = new Connection({
      endpoint: cfg.endpoint,
      realm: cfg.realm,
      serializer: new BrowserMSGPackSerializer(),
      transport: BrowserWebSocketTransport,
      logFunction: () => { /* nothing to do */ },
      authProvider: new TicketAuthProvider(username, async () => {
        return { signature: '' };
      }),
    });
    localStore.setState({
      ...state,
      connState: EConnectionState.Connecting,
      message: ['Connecting to server...'],
    });
    try {
      const details = await connection.Open();
      connection.OnClose().then(() => {
        localStore.setState({
          ...localStore.getState(),
          connState: EConnectionState.Disconnected,
        });
      });
      const instanceId = (details.authextra || {}).containerid || null;
      const ready = (details.authextra || {}).ready || false;
      localStore.setState({
        ...localStore.getState(),
        connState: ready ? EConnectionState.Connected : EConnectionState.Connecting,
        username: details.authid || username,
        instanceid: instanceId,
        connection,
        message: [...localStore.getState().message, 'Reserving some storage...'],
      });
      await connection.Subscribe<[string], WampDict>(`rocks.git.${instanceId}.state`, ([stateMessage]) => {
        const oldState = localStore.getState();
        switch (stateMessage) {
          case 'pvcbound': {
            localStore.setState({
              ...oldState,
              message: [...oldState.message, 'Spinning up your container...'],
            });
            break;
          }
          case 'podrunning': {
            localStore.setState({
              ...oldState,
              message: [...oldState.message, 'Initializing some beautiful examples...'],
            });
            break;
          }
          case 'ready': {
            localStore.setState({
              ...oldState,
              message: [],
              connState: EConnectionState.Connected,
            });
            break;
          }
          default: {
            localStore.setState({
              ...oldState,
              message: [...oldState.message, stateMessage],
            });
            break;
          }
        }
      });
    } catch (e) {
      localStore.setState({
        ...state,
        connState: EConnectionState.Error,
        errorMessage: `Server unreachable: ${e.toString()}`,
      });
    }
  },
  resetConn: (state: State) => {
    state.connection.Close();
    localStore.setState({
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
