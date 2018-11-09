import { Component, h } from 'preact'
import { Counter, EConnectionState, Label, Button } from '@app/types'
import './style.scss'

export class CounterLabel extends Component<Label> {
  render ({ label }: Label) {
    return <h1>{label}</h1>
  }
}

export class CounterButton extends Component<Button> {
  render ({ label, disabled, action }: Button) {
    return <button onClick={action} disabled={disabled}>{label}</button>
  }
}

export class CounterComponent extends Component<Counter, { user: string }> {
  render ({ connState, connect }: Counter) {
    return <div>
    <input onChange={e => this.setState({user: (e.target as any).value})}/>
    <CounterLabel label={connState} />
    <CounterButton action={() => connect(this.state.user)} label='Connect' disabled={connState !== EConnectionState.Disconnected} />
    </div>
  }
}
