import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { Web3Wallet } from '@walletconnect/web3wallet/dist/types/client'
import { Namespaces } from 'features/walletConnect'

// https://github.com/WalletConnect/web-examples/blob/e0059fa65c7dd9d26e8e9deb834e7af39fe7fb0b/wallets/react-web3wallet/src/views/SessionProposalModal.tsx#L62
export function createWalletConnectSessionApprovalConfiguration({
  approvedAddresses,
  proposal,
}: {
  readonly approvedAddresses: readonly string[]
  readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
}): Parameters<Web3Wallet['approveSession']>[0] {
  const { id, params } = proposal
  const { requiredNamespaces, relays } = params

  const relayProtocol = relays[0]?.protocol

  const namespaces = Object.entries(requiredNamespaces).reduce<Namespaces>(
    (res, [namespaceKey, { methods, events, chains }]) => ({
      ...res,
      [namespaceKey]: {
        accounts: approvedAddresses.flatMap((approvedAddress) =>
          chains
            ? chains.map((chain) => `${chain}:${approvedAddress}`)
            : approvedAddress
        ),
        methods,
        events,
      },
    }),
    {}
  )

  // The returned namespaces object looks something like:
  // {
  //   "near": {
  //     "accounts": ["near:testnet:ed57e3893b4ae21a924ef44943acecacd663e4a3a756299f098f34f390decdeb"],
  //     "events": [],
  //     "methods": ["near_signIn", "near_signOut", "near_getAccounts", "near_signAndSendTransaction", "near_signAndSendTransactions"]
  //   }
  // }

  return { id, relayProtocol, namespaces }
}
