import * as React from 'react'

import { ChainMetadata } from '~/features/caip'

export function useMaybeChainMetadataExplorerUrl({
  chainMetadata: maybeChainMetadata,
  transactionHash: maybeTransactionHash,
}: {
  readonly chainMetadata: ChainMetadata | null | undefined
  readonly transactionHash?: string | null
}) {
  return React.useMemo(() => {
    if (!maybeChainMetadata) return null

    const [maybeExplorer] = maybeChainMetadata?.blockExplorers || []

    if (!maybeExplorer) return null

    const { url } = maybeExplorer

    if (
      typeof maybeTransactionHash !== 'string' ||
      !maybeTransactionHash.length
    )
      return url

    // Backwards compatibility with URLs sourced from the Wallet Provider.
    if (url.includes('%s')) return url.replace(/%s/g, maybeTransactionHash)

    // TODO: this is naive, format the url correctly
    // TODO: repsect the block explorer `type` format if specified
    return `${url}${!url.endsWith('/') ? '/' : ''}tx/${maybeTransactionHash}`
  }, [maybeChainMetadata, maybeTransactionHash])
}
