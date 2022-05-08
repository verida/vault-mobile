import { DApp, WalletConnectRequest } from 'wallet-connect/types'

import { Reducer } from '../types'

export interface State {
  dapps: DApp[]
  requests: WalletConnectRequest[]
  openRequest?: WalletConnectRequest
}

const initialState: State = {
  dapps: [],
  requests: [],
  openRequest: undefined,
}

export const walletConnectReducer: Reducer<State> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'Remove_WC_APP': {
      return {
        ...state,
        dapps: state.dapps.filter(
          (app) => app.session.key !== action.payload.key
        ),
      }
    }
    case 'SET_WC_REQUESTS':
      return {
        ...state,
        requests: action.payload.requests,
      }
    case 'ADD_WC_REQUEST':
      return {
        ...state,
        requests: [...state.requests, action.payload.request],
      }

    case 'REMOVE_WC_REQUEST':
      return {
        ...state,
        requests: state.requests.filter(
          (request) => request.id !== action.payload.request.id
        ),
      }

    case 'SET_WC_PEER_META': {
      const { connector, peerMeta } = action.payload
      const dapps = [...state.dapps]
      const dapp = dapps.find((app) => app.session.key === connector.key)
      if (dapp) {
        dapp.session.peerMeta = { ...peerMeta }
      } else {
        dapps.push({
          session: {
            connected: false,
            key: connector.key,
            peerMeta: { ...peerMeta },
          } as any,
        })
      }
      return {
        ...state,
        dapps,
      }
    }

    case 'APPROVE_WC_PEER_META': {
      const { connector } = action.payload
      const dapps = [...state.dapps]
      const session = connector.session
      const dapp = dapps.find((app) => app.session.key === connector.key)
      if (dapp) {
        dapp.session = { ...session }
      } else {
        dapps.push({
          session: { ...session },
        })
      }
      return {
        ...state,
        dapps,
      }
    }

    case 'REJECT_WC_PEER_META': {
      const { connector } = action.payload
      const dapps = state.dapps.filter(
        (app) => app.session.key !== connector.key
      )
      return {
        ...state,
        dapps,
      }
    }

    case 'SHOW_WC_REQUEST': {
      const { request } = action.payload

      return {
        ...state,
        openRequest: request,
      }
    }

    case 'HIDE_WC_REQUEST': {
      return {
        ...state,
        openRequest: undefined,
      }
    }

    case 'LOGOUT' as any:
      return initialState

    default:
      return state
  }
}
