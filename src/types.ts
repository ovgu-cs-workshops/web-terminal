import { Connection } from '@verkehrsministerium/kraftfahrstrasse';

export enum EConnectionState {
  Disconnected = 'disconnected from server',
  Connecting = 'connecting to server',
  Connected = 'connected to server',
  Error = 'failed to connect to server',
}

export interface State {
  connState: EConnectionState
  username: string | null,
  instanceid: string | null,
  connection: Connection | null,
  errorMessage: string | null,
}

export interface Actions {
  connect (username: string): void
}

export interface ConnState {
  connect (username: string): void;
  connState: EConnectionState;
}

export interface MainConnState {
  connState: EConnectionState;
  errorMessage?: string;
}

export interface Label {
  label: string;
}

export interface Button {
  disabled?: boolean;
  action: () => void;
}
