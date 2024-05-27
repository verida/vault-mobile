import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import { keyStores, utils } from 'near-api-js'

import { NearAccount, throwIfNotNearTestnet } from '~/features/blockchain/near'
import { SupportedBlockchainNamespace } from '~/features/blockchain/types/enums'
import { CryptoWalletAccounts } from '~/features/cryptoWallet'

import { getMaybeMinifiedBlockchainAccountForWalletConnectRequest } from './getMaybeMinifiedBlockchainAccountForWalletConnectRequest'

export async function getMaybeNearAccountForPrivateKey({
  privateKey,
  signerId,
  caipChainId,
}: {
  readonly privateKey: string
  readonly signerId: string
  readonly caipChainId: ChainId
}) {
  if (caipChainId.namespace !== SupportedBlockchainNamespace.NEAR)
    return undefined

  const { reference } = caipChainId

  const keyPair = utils.KeyPair.fromString(privateKey)

  const publicKey = keyPair.getPublicKey().toString()

  const keystore = new keyStores.InMemoryKeyStore()

  // HACK: Deterministic account creation.
  const accountId = signerId

  await keystore.setKey(reference, accountId, keyPair)

  const nearAccount: NearAccount = {
    keystore,
    signerId,
    publicKey,
    caipChainId,
    privateKey,
  }

  return nearAccount
}

// https://docs.near.org/tools/near-api-js/quick-reference#key-store
export async function getMaybeNearAccountForWalletConnectRequest({
  web3wallet,
  request,
  minifiedBlockchainAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedBlockchainAccounts: CryptoWalletAccounts
}): Promise<NearAccount | undefined> {
  const { params } = request

  const caipChainId = new ChainId(params.chainId)

  if (caipChainId.namespace !== SupportedBlockchainNamespace.NEAR)
    return undefined

  throwIfNotNearTestnet(caipChainId)

  const maybeBlockchainWalletAccount =
    getMaybeMinifiedBlockchainAccountForWalletConnectRequest({
      web3wallet,
      request,
      minifiedBlockchainAccounts,
    })

  if (!maybeBlockchainWalletAccount) return undefined

  let { privateKey, address: signerId } = maybeBlockchainWalletAccount
  privateKey = privateKey!
  signerId = signerId!

  return getMaybeNearAccountForPrivateKey({
    caipChainId,
    privateKey,
    signerId,
  })
}

export async function getNearAccountForWalletConnectRequestOrThrow({
  web3wallet,
  request,
  minifiedBlockchainAccounts,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly minifiedBlockchainAccounts: CryptoWalletAccounts
}): Promise<NearAccount> {
  const maybeNearAccount: NearAccount | undefined =
    await getMaybeNearAccountForWalletConnectRequest({
      web3wallet,
      request,
      minifiedBlockchainAccounts,
    })

  if (!maybeNearAccount)
    throw new Error(`Unable to determine NearAccount for request.`)

  return maybeNearAccount
}
