import { h } from 'preact';
import { connect, Provider } from 'unistore/preact';

import { actions, store } from '@app/store';
import { Actions, State } from '@app/types';

import { MainComponent } from '@components/main';
import { TopBarComponent } from '@components/topbar';
import '@styles/main.scss';

const App = connect<{}, State & Actions, State & Actions, State & Actions>(x => x, actions)(
  (props: State & Actions) =>
  <div class='layout'>
    <TopBarComponent connect={props.connect} connState={props.connState} />
    <MainComponent
      connState={props.connState}
      errorMessage={props.errorMessage}
      instance={props.instanceid}
      connection={props.connection}
      message={props.message}
      resetConn={props.resetConn} />
  </div>,
);

export default () => (
  <Provider store={store}>
      <App />
  </Provider>
);
