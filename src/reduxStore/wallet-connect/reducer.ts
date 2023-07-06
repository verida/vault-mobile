import { DApp, DAppv2 } from 'wallet-connect/types'

import { Reducer } from '../types'

export interface State {
  dapps: DApp[]
  dappsv2: DAppv2[]
}

const initialState: State = {
  dapps: [],
  dappsv2: [],
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

    case 'APPROVE_WC_SESSION': {
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

    case 'REJECT_WC_SESSION': {
      const { connector } = action.payload
      const dapps = state.dapps.filter(
        (app) => app.session.key !== connector.key
      )
      return {
        ...state,
        dapps,
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

    case 'auth/logout' as any:
      return initialState

    default:
      return state
  }
}
