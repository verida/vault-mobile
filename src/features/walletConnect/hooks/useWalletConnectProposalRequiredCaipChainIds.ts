import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import * as React from 'react'

export const getWalletConnectProposalRequiredCaipChainIds = (
  proposal:
    | Web3WalletTypes.EventArguments['session_proposal']
    | null
    | undefined
) => {
  const maybeRequiredNamespaces = proposal?.params?.requiredNamespaces

  if (!maybeRequiredNamespaces) return []

  const uniqueCaipIdentifiers = [
    ...new Set(
      Object.values(maybeRequiredNamespaces).flatMap(
        (requiredNamespaces) => requiredNamespaces.chains
      )
    ),
  ]

  return uniqueCaipIdentifiers.flatMap((uniqueCaipIdentifier) => {
    if (!uniqueCaipIdentifier) return []

    return [new ChainId(uniqueCaipIdentifier)]
  })
}

export function useWalletConnectProposalRequiredCaipChainIds(
  proposal:
    | Web3WalletTypes.EventArguments['session_proposal']
    | null
    | undefined
): readonly ChainId[] {
  return React.useMemo(
    () => getWalletConnectProposalRequiredCaipChainIds(proposal),
    [proposal]
  )
}
