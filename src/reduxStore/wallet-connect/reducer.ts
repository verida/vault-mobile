import {
  DApp,
  DAppv2,
  IChainData,
  WalletConnectRequest,
} from 'wallet-connect/types'

import { SUPPORTED_CHAINS } from '../../wallet-connect/constants'
import { Reducer } from '../types'

export interface State {
  dapps: DApp[]
  dappsv2: DAppv2[]
  requests: WalletConnectRequest[]
  openRequest?: WalletConnectRequest
  network: IChainData
}

const initialState: State = {
  dapps: [],
  dappsv2: [],
  requests: [],
  openRequest: undefined,
  network: SUPPORTED_CHAINS[0],
}

export const walletConnectReducer: Reducer<State> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case 'REMOVE_WC_APP': {
      return {
        ...state,
        dapps: state.dapps.filter(
          (app) => app.session.key !== action.payload.key
        ),
      }
    }
    case 'SET_WC_APP': {
      const { walletId, key } = action.payload
      let dapps = [...state.dapps]
      const index = dapps.findIndex((app) => app.session.key === key)
      if (index >= 0) {
        dapps.splice(index, 1, {
          walletId,
          session: { ...action.payload.session },
        })
      } else {
        dapps = [...dapps, { walletId, session: { ...action.payload.session } }]
      }
      return {
        ...state,
        dapps,
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
      const { walletId, connector, peerMeta } = action.payload
      const dapps = [...state.dapps]
      const dapp = dapps.find((app) => app.session.key === connector.key)
      if (dapp) {
        dapp.session.peerMeta = { ...peerMeta }
      } else {
        dapps.push({
          walletId,
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
      const { walletId, connector, accounts, chainId, chain } = action.payload
      const dapps = [...state.dapps]
      const session = connector.session
      const dapp = dapps.find((app) => app.session.key === connector.key)
      if (dapp) {
        dapp.session = { ...session }
        dapp.accounts = accounts
        dapp.chain = chain
        dapp.chainId = chainId
      } else {
        dapps.push({
          walletId,
          session: { ...session },
          accounts,
          chainId,
          chain,
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

    case 'SET_WC_NETWORK': {
      return {
        ...state,
        network: action.payload.network,
      }
    }

    // WC v2
    case 'APPROVE_WC_SESSSION_V2': {
      const dappsv2 = !state.dappsv2 ? [] : [...state.dappsv2]
      const { id, topic, walletId, metadata, namespaces, relayProtocol } =
        action.payload
      dappsv2.push({ id, topic, walletId, metadata, namespaces, relayProtocol })
      return {
        ...state,
        dappsv2,
      }
    }

    case 'REMOVE_WC_SESSSION_V2': {
      const dappsv2 = (!state.dappsv2 ? [] : [...state.dappsv2]).filter(
        (app) => app.topic !== action.payload.topic
      )
      return {
        ...state,
        dappsv2,
      }
    }

    case 'LOGOUT' as any:
      return initialState

    default:
      return state
  }
}
