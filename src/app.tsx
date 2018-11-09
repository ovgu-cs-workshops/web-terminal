import { h } from 'preact'
import { connect, Provider } from 'unistore/preact'
import { actions, store } from '@app/store'
import { Actions, State } from '@app/types'
import { Logo } from '@components/logo'
import { CounterComponent } from '@components/counter'
import '@styles/style.scss'

const App = connect<{}, State & Actions, State & Actions>(x => x, actions)(
  (props: State & Actions) => {
    console.log(props);
    return <div>
    <CounterComponent connect={props.connect} connState={props.connState} />
  </div>;}
)

export default () => (
  <Provider store={store}>
    <main>
      <App />
    </main>
  </Provider>
)
