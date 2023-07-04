import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { maybeParseCaip, ParsedCaipType } from 'features/caip'
import * as React from 'react'

export function useWalletConnectProposalRequiredCaipTypes(
  proposal:
    | Web3WalletTypes.EventArguments['session_proposal']
    | null
    | undefined
): readonly ParsedCaipType[] {
  return React.useMemo(() => {
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
      const maybeParsedCaipType = maybeParseCaip(uniqueCaipIdentifier)

      if (!maybeParsedCaipType) return []

      return [maybeParsedCaipType]
    })
  }, [proposal])
}
