import axios from 'axios'
import { ChainId } from 'caip'

import { ChainMetadatas, SupportedCaipNamespace } from '../../../caip/@types'
import {
  AddEthereumChainRequestParam,
  AddEthereumChainRequestParamBlockExplorerUrls,
  AddEthereumChainRequestParamRpcUrls,
  ChainsList,
  ChainsListItem,
} from '../@types'

export async function fetchChainsList(): Promise<ChainsList> {
  const { data } = await axios({
    url: 'https://chainid.network/chains.json',
    method: 'get',
  })

  return ChainsList.parse(data)
}

export const chainsListItemToMaybeAddEthereumRequestParam = ({
  name: chainName,
  chainId,
  nativeCurrency: { name: nativeCurrencyName, symbol },
  rpc,
  explorers,
}: ChainsListItem): AddEthereumChainRequestParam | undefined => {
  const rpcUrlsResult = AddEthereumChainRequestParamRpcUrls.safeParse(rpc)

  const blockExplorerUrlsResult =
    AddEthereumChainRequestParamBlockExplorerUrls.safeParse(
      (explorers || []).flatMap(({ url }) => [url])
    )

  if (!rpcUrlsResult.success || !blockExplorerUrlsResult.success)
    return undefined

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName,
    rpcUrls: rpcUrlsResult.data,
    nativeCurrency: {
      name: nativeCurrencyName,
      symbol,
    },
    blockExplorerUrls: blockExplorerUrlsResult.data,
  }
}

export const getMaybeAddEthereumChainRequestParamByChainId = ({
  chainId,
  chainsList,
}: {
  readonly chainId: number
  readonly chainsList: ChainsList
}): AddEthereumChainRequestParam | undefined => {
  const maybeChainListItem = chainsList.find((e) => e?.chainId === chainId)

  if (!maybeChainListItem) return undefined

  return chainsListItemToMaybeAddEthereumRequestParam(maybeChainListItem)
}

export const chainMetadatasToAddEthereumChainRequestParamsOrThrow = ({
  chainMetadatas,
  chainsList,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly chainsList: ChainsList
}): readonly AddEthereumChainRequestParam[] => {
  // Ensure all of the chainMetadatas are EVM-based. If not, this is a development
  // error - we need to implement a higher-order function which switches between
  // different transformers for different networks.

  const requestedNamespaces = [
    ...new Set(chainMetadatas.map((e) => e.namespace)),
  ]
  const unsupportedNamspaces = requestedNamespaces.filter(
    (e) => e !== SupportedCaipNamespace.EIP_155
  )

  if (unsupportedNamspaces.length)
    throw new Error(
      `Attempted to process (${unsupportedNamspaces.join(
        ','
      )}) namespaces within an ${
        SupportedCaipNamespace.EIP_155
      }-specific context.`
    )

  // Attempt to convert the requested chains.
  const addEthereumChainRequestParams = chainMetadatas.map(({ reference }) =>
    getMaybeAddEthereumChainRequestParamByChainId({
      chainId: Number.parseInt(reference, 10),
      chainsList,
    })
  )

  // Track a list of all of the chains we were unable to convert.
  const wasUnableToTransform = chainMetadatas.filter(
    (_, i) => !addEthereumChainRequestParams[i]
  )

  // Throw if we were unable to convert any of the requested chains.
  if (wasUnableToTransform.length)
    throw new Error(
      `Was unable to create AddEthereumChainRequestParams for ${wasUnableToTransform
        .map((e) => new ChainId(e).toString())
        .join(',')}.`
    )

  return addEthereumChainRequestParams.flatMap((e, i) => {
    if (!e) return []

    const { rpcUrls, name: chainName } = chainMetadatas[i]

    // HACK: Even though the chainList defines an array of valid rpcURLs,
    //       we must respect the URLs described in the ChainMetadata - we
    //       should only provide supplementary information, and not invalidate
    //       the request of the caller.
    return e ? [{ ...e, rpcUrls, chainName }] : []
  }) /* satisfy_types */
}
