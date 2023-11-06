import { ChainId } from 'caip'
import {
  getBalanceEip155,
  getBalanceNear,
  getNearAccountId,
} from 'features/blockchain'
import {
  ChainMetadatas,
  getRpcUrlOrThrow,
  SupportedCaipNamespace,
} from 'features/caip'

import { CryptoWalletBalances, MinifiedVeridaAccounts } from '../@types'

export async function fetchCryptoWalletBalances({
  chainMetadatas,
  minifiedAccounts,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly minifiedAccounts: MinifiedVeridaAccounts
}): Promise<CryptoWalletBalances> {
  const eip155Addresses = [
    ...new Set(
      minifiedAccounts
        .filter(({ namespace }) => namespace === SupportedCaipNamespace.EIP_155)
        .map(({ address }) => address)
    ),
  ]

  const nearAddresses = [
    ...new Set(
      minifiedAccounts
        .filter(({ namespace }) => namespace === SupportedCaipNamespace.NEAR)
        .map(({ address }) => address)
    ),
  ]

  // TODO: It makes a lot more sense to just ignore accounts entirely and do
  //       every transaction from a raw address, since this adds too much complexity.
  //       The existing codebase would get simpler too.
  // This is NOT correct. It assumes we can always derive the NEAR address
  // from the minified account, which will not hold true for very long.
  // TODO: How do we tell which balance a user wants to send from? It seems like
  //       both raw addresses and accounts possess balances.
  const nearAccounts = nearAddresses.map((address) =>
    getNearAccountId({ signerId: address })
  )

  const allNearSources = [...new Set([...nearAddresses, ...nearAccounts])]

  // TODO: dedup
  const eip155Chains = chainMetadatas.filter(
    (e) => e.namespace === SupportedCaipNamespace.EIP_155
  )

  const nearChains = chainMetadatas.filter(
    (e) => e.namespace === SupportedCaipNamespace.NEAR
  )

  const eip155Rpcs = eip155Chains.map((e) =>
    getRpcUrlOrThrow({
      chainId: new ChainId(e),
      chainMetadatas,
    })
  )

  const [eip155Balances, nearBalances] = await Promise.all([
    Promise.all(
      eip155Rpcs.map((rpcUrl) =>
        Promise.all(
          eip155Addresses.map((address) =>
            getBalanceEip155({
              address,
              rpcUrl,
            })
              .then((e) => e.toString())
              .catch(() => null)
          )
        )
      )
    ),
    Promise.all(
      nearChains.map(({ namespace, reference }) =>
        Promise.all(
          allNearSources.map((address) =>
            getBalanceNear({
              chainId: new ChainId({ namespace, reference }),
              chainMetadatas,
              address,
            })
              .then((e) => e.available)
              .catch(() => null)
          )
        )
      )
    ),
  ])

  const eip155CryptoWalletBalances = Object.fromEntries(
    eip155Chains.map((eip155Chain, i) => {
      return [
        new ChainId(eip155Chain).toString(),
        Object.fromEntries(
          eip155Addresses.map((address, j) => [address, eip155Balances[i][j]])
        ),
      ]
    })
  )

  const nearCryptoWalletBalances = Object.fromEntries(
    nearChains.map((nearChain, i) => {
      return [
        new ChainId(nearChain).toString(),
        Object.fromEntries(
          allNearSources.map((address, j) => [address, nearBalances[i][j]])
        ),
      ]
    })
  )

  return { ...eip155CryptoWalletBalances, ...nearCryptoWalletBalances }
}
