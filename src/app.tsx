import { h } from 'preact'
import { connect, Provider } from 'unistore/preact'
import { actions, store } from '@app/store'
import { Actions, State } from '@app/types'
import { TopBarComponent } from '@components/topbar'
import { MainComponent } from '@components/main'
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import '@styles/main.scss';

Terminal.applyAddon(fit);

const App = connect<{}, State & Actions, State & Actions>(x => x, actions)(
  (props: State & Actions) =>
  <div class="layout">
    <TopBarComponent connect={props.connect} connState={props.connState} />
    <MainComponent connState={props.connState} errorMessage={props.errorMessage} />
  </div>
)

export default () => (
  <Provider store={store}>
      <App />
  </Provider>
)
