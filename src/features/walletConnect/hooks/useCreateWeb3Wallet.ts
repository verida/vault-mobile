import { AuthClientTypes } from '@walletconnect/auth-client'
import { Core } from '@walletconnect/core'
import { IWeb3Wallet, Web3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import { config } from 'config'
import { veridaWalletMetadata } from 'features/walletConnect'
import * as React from 'react'

// TODO: This should be IStateful.
type State = Readonly<
  | { loading: true }
  | { loading: false; web3wallet: IWeb3Wallet }
  | { loading: false; error: Error }
>

const loadingState = (): State => ({ loading: true })

// If the state is successful, will return the evaluted Web3Wallet, else null.
export const useMaybeWeb3Wallet = (state: State): IWeb3Wallet | null => {
  if (state.loading || !('web3wallet' in state)) return null

  return state.web3wallet
}

export function useCreateWeb3Wallet({
  onSessionRequest,
  onSessionProposal,
  onSessionDelete,
  metadata = veridaWalletMetadata,
}: {
  readonly onSessionProposal: (
    web3wallet: IWeb3Wallet,
    event: Web3WalletTypes.EventArguments['session_proposal']
  ) => Promise<void>
  readonly onSessionRequest: (
    web3wallet: IWeb3Wallet,
    event: Web3WalletTypes.EventArguments['session_request']
  ) => void
  readonly onSessionDelete: (
    web3wallet: IWeb3Wallet,
    event: Web3WalletTypes.EventArguments['session_delete']
  ) => void
  readonly metadata?: AuthClientTypes.Metadata
}): State {
  const [state, setState] = React.useState<State>(loadingState)

  React.useEffect(() => {
    ;(async () => {
      try {
        setState(loadingState)

        const core = new Core({
          projectId: config.WALLETCONNECT_PROJECT_ID,
          relayUrl: config.WALLETCONNECT_RELAY_URL,
        })

        const web3wallet = await Web3Wallet.init({
          core,
          metadata,
        })

        web3wallet.on('session_proposal', (e) =>
          onSessionProposal(web3wallet, e)
        )
        web3wallet.on('session_request', (e) => onSessionRequest(web3wallet, e))
        web3wallet.on('session_delete', (e) => onSessionDelete(web3wallet, e))

        setState({ loading: false, web3wallet })
      } catch (cause) {
        setState({
          loading: false,
          error: new Error('Failed to instantiate a Web3Wallet.', { cause }),
        })
      }
    })()
  }, [onSessionRequest, onSessionProposal, onSessionDelete, metadata])

  return state
}
