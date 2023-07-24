import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { Web3Wallet } from '@walletconnect/web3wallet/dist/types/client'
import { AccountId } from 'caip'
import { Namespaces } from 'features/walletConnect'

// Given a selection of AccountIds that have been chosen by the user (i.e. in
// the WalletConnectModalConnectDapp), check to see that an entry exists in the
// approvedAccounts for all the chains requested by WalletConnect in the
// connection proposal.
//
// This is used for the case where, for example, a user picks an EIP155-compatible
// wallet for Ethereum Goerli, but they haven't explicitly enabled Sepolia -  and
// WalletConnect is requesting to attach to Sepolia as well as Goerli. If we didn't
// explicitly check to see if the wallet was enabled for all accounts, a user could
// unknowingly connect to an unsupported chain. Here we check that the requestedAddress
// exists inside of the approvedAccounts for ALL chains.
//
// If the single address doesn't exist for BOTH Sepolia and Goerli, it would be
// deemed to not support all required chains, and therefore return false.
const addressExistsForAllRequestedChains = ({
  requestedAddress,
  approvedAccounts,
  requestedChains,
}: {
  readonly requestedAddress: string
  readonly requestedChains: readonly string[] | undefined
  readonly approvedAccounts: readonly AccountId[]
}) => {
  if (!Array.isArray(requestedChains) || !requestedChains.length) return false

  const approvedAccountCaipIdentifiers = [
    ...new Set(approvedAccounts.map((e) => e.toString())),
  ]

  return requestedChains.every((chainId: string) =>
    approvedAccountCaipIdentifiers.includes(
      new AccountId({ chainId, address: requestedAddress }).toString()
    )
  )
}

// Generates a session approval response object for WalletConnect.
//
// Note, this function is only capable of returning an approval for all of the
// approvedAccounts provided by the caller. It is possible for
// the caller to provide only a subset of the approvedAccounts actually demanded
// by the session request; in this scenario, the approval can be rejected.
//
// Callers must ensure the array of approvedAccounts they pass meets the
// requirements of the request.
//
// https://github.com/WalletConnect/web-examples/blob/e0059fa65c7dd9d26e8e9deb834e7af39fe7fb0b/wallets/react-web3wallet/src/views/SessionProposalModal.tsx#L62
export function createWalletConnectSessionApprovalConfiguration({
  approvedAccounts,
  proposal,
}: {
  readonly approvedAccounts: readonly AccountId[]
  readonly proposal: Web3WalletTypes.EventArguments['session_proposal']
}): Parameters<Web3Wallet['approveSession']>[0] {
  const { id, params } = proposal
  const { requiredNamespaces, relays } = params

  const relayProtocol = relays[0]?.protocol

  const namespaces = Object.entries(requiredNamespaces).reduce<Namespaces>(
    (res, [namespaceKey, { methods, events, chains }]) => {
      // First, find accounts which correspond to the namespace.
      const approvedAccountsForNamespace = approvedAccounts.filter(
        (e) => e.chainId.namespace === namespaceKey
      )

      // If no accounts have been selected for this namespace, ignore.
      if (!approvedAccountsForNamespace.length) return res

      // First, get all unique addresses for the current namespace.
      const uniqueAddressesForNamespace = [
        ...new Set(approvedAccountsForNamespace.map(({ address }) => address)),
      ]

      // Here, we will return only the addresses which the caller has asserted exist for ALL of the specified
      // chains. If the address is not provided for a given chain, it will *not* be returned.
      const approvedAddressesForRequestedChains =
        Array.isArray(chains) && chains.length
          ? uniqueAddressesForNamespace.filter((address) =>
              addressExistsForAllRequestedChains({
                requestedAddress: address,
                approvedAccounts,
                requestedChains: chains,
              })
            )
          : uniqueAddressesForNamespace

      if (!approvedAddressesForRequestedChains.length) return res

      return {
        ...res,
        [namespaceKey]: {
          accounts: approvedAddressesForRequestedChains.flatMap(
            (approvedAddress) =>
              chains
                ? chains.map((chain) => `${chain}:${approvedAddress}`)
                : approvedAddress
          ),
          methods,
          events,
        },
      }
    },
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
