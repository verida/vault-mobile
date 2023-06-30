import { AuthClientTypes } from '@walletconnect/auth-client'
import { Core } from '@walletconnect/core'
import { IWeb3Wallet, Web3Wallet } from '@walletconnect/web3wallet'
import { Web3WalletTypes } from '@walletconnect/web3wallet/dist/types/types/client'
import * as React from 'react'

const WALLETCONNECT_PROJECT_ID_SHOULD_BE_ENVIRONMENT_VARIABLE =
  '1890472fb88366dd4046858b11e705cd'

const WALLETCONNECT_RELAY_URL_SHOULD_BE_ENVIRONMENT_VARIABLE =
  'wss://relay.walletconnect.com'

// TODO: Should be a function of config.
const defaultMetadata: AuthClientTypes.Metadata = {
  name: 'Verida Vault',
  description: 'Verida Vault for WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

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
  metadata = defaultMetadata,
}: {
  readonly onSessionProposal: (
    web3wallet: IWeb3Wallet,
    event: Web3WalletTypes.EventArguments['session_proposal']
  ) => void
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

  React.useEffect(
    () =>
      void (async () => {
        try {
          setState(loadingState)

          const core = new Core({
            projectId: WALLETCONNECT_PROJECT_ID_SHOULD_BE_ENVIRONMENT_VARIABLE,
            relayUrl: WALLETCONNECT_RELAY_URL_SHOULD_BE_ENVIRONMENT_VARIABLE,
          })

          const web3wallet = await Web3Wallet.init({
            core,
            metadata,
          })

          web3wallet.on('session_proposal', (e) =>
            onSessionProposal(web3wallet, e)
          )
          web3wallet.on('session_request', (e) =>
            onSessionRequest(web3wallet, e)
          )
          web3wallet.on('session_delete', (e) => onSessionDelete(web3wallet, e))

          setState({ loading: false, web3wallet })
        } catch (cause) {
          setState({
            loading: false,
            // @ts-expect-error language_version
            error: new Error('Failed to instantiate a Web3Wallet.', { cause }),
          })
        }
      })(),
    [onSessionRequest, onSessionProposal, onSessionDelete, metadata]
  )

  return state
}
