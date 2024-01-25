import { SupportedBlockchainNamespace } from 'features/blockchain'
import {
  ChainMetadata,
  HACK__getFirstRpcUrl,
  isSupportedCaipNamespace,
} from 'features/caip'
import * as React from 'react'
import { ZodError } from 'zod-validation-error'

type EvaluationResult = {
  readonly data: ChainMetadata | null
  readonly error?: ZodError
}

export function useCreateChainMetadataFormFields({
  initialValue,
}: {
  readonly initialValue: ChainMetadata | null | undefined
}) {
  const [name, setName] = React.useState<string>(initialValue?.name || '')

  const [rpcUrl, setRpcUrl] = React.useState<string>(
    // Here we assert that when modifying ChainMetadata, we
    // use the convention that we are only interested in the
    // first element of the array of rpcUrls.
    HACK__getFirstRpcUrl(initialValue?.rpcUrls) || ''
  )

  const maybeInitialNamespace = initialValue?.namespace

  const [namespace, setNamespace] =
    React.useState<SupportedBlockchainNamespace>(
      isSupportedCaipNamespace(maybeInitialNamespace)
        ? maybeInitialNamespace
        : SupportedBlockchainNamespace.EIP_155
    )

  const [reference, setReference] = React.useState<string>(
    initialValue?.reference || ''
  )

  const maybeInitialDecimals = initialValue?.decimals

  const [decimals, setDecimals] = React.useState<number>(
    typeof maybeInitialDecimals === 'number' ? maybeInitialDecimals : 18
  )

  const [nativeCurrencyName, setNativeCurrencyName] = React.useState<string>(
    initialValue?.nativeCurrencyName || ''
  )

  const [symbol, setSymbol] = React.useState<string>(initialValue?.symbol || '')

  const [icon, setIcon] = React.useState<string>(initialValue?.icon || '')

  // HACK: Here we only support a single block explorer for now. We also don't
  //       define the standard or the name.
  const [blockExplorerUrl, setBlockExplorerUrl] = React.useState<string>(
    initialValue?.blockExplorers?.[0]?.url || ''
  )

  const maybeInitialIsMainnet = initialValue?.isMainnet

  const [isMainnet, setIsMainnet] = React.useState<boolean | null>(
    typeof maybeInitialIsMainnet === 'boolean' ? maybeInitialIsMainnet : null
  )

  const getMaybeEvaluatedChainMetadata =
    React.useCallback((): EvaluationResult => {
      const blockExplorers =
        typeof blockExplorerUrl === 'string' && blockExplorerUrl.length
          ? [{ url: blockExplorerUrl }]
          : []

      const maybeChainMetadata = {
        namespace,
        reference,
        rpcUrls: [rpcUrl],
        name,
        symbol,
        decimals,
        nativeCurrencyName,
        icon,
        blockExplorers,
        isMainnet,
      }
      const result = ChainMetadata.safeParse(maybeChainMetadata)

      if (!result.success) return { data: null, error: result.error }

      const { data } = result

      return { data }
    }, [
      blockExplorerUrl,
      namespace,
      reference,
      rpcUrl,
      name,
      symbol,
      decimals,
      nativeCurrencyName,
      icon,
      isMainnet,
    ])

  const evaluationResult = React.useMemo(getMaybeEvaluatedChainMetadata, [
    getMaybeEvaluatedChainMetadata,
  ])

  return {
    name,
    setName,
    rpcUrl,
    setRpcUrl,
    namespace,
    setNamespace,
    reference,
    setReference,
    decimals,
    setDecimals,
    nativeCurrencyName,
    setNativeCurrencyName,
    symbol,
    setSymbol,
    icon,
    setIcon,
    blockExplorerUrl,
    setBlockExplorerUrl,
    getMaybeEvaluatedChainMetadata,
    isMainnet,
    setIsMainnet,
    evaluationResult,
  }
}
