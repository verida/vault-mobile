import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { ChainId } from 'caip'
import {
  getNearAccountId,
  NearAccount,
  nearDoesAccountExist,
  nearInstantiateAccount,
  throwIfNotNearTestnet,
} from 'features/blockchain/near'
import { ChainMetadatas, SupportedCaipNamespace } from 'features/caip'
import { useWalletsData } from 'features/cryptoWallet'
import { keyStores, utils } from 'near-api-js'

import { getMaybeVeridaWalletAccountForWalletConnectRequest } from './getMaybeVeridaWalletAccountForWalletConnectRequest'

// https://docs.near.org/tools/near-api-js/quick-reference#key-store
export async function getMaybeNearAccountForWalletConnectRequest({
  chainMetadatas,
  web3wallet,
  request,
  walletsData,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<NearAccount | undefined> {
  const { params } = request

  const caipChainId = new ChainId(params.chainId)

  if (caipChainId.namespace !== SupportedCaipNamespace.NEAR) return undefined

  throwIfNotNearTestnet(caipChainId)

  const maybeVeridaWalletAccount =
    getMaybeVeridaWalletAccountForWalletConnectRequest({
      web3wallet,
      request,
      walletsData,
    })

  if (!maybeVeridaWalletAccount) return undefined

  const { privateKey, address: signerId } = maybeVeridaWalletAccount

  const { reference } = caipChainId

  const keyPair = utils.KeyPair.fromString(privateKey)

  const publicKey = keyPair.getPublicKey().toString()

  const keystore = new keyStores.InMemoryKeyStore()

  // HACK: Deterministic account creation.
  const accountId = getNearAccountId({
    signerId,
  })

  await keystore.setKey(reference, accountId, keyPair)

  const nearAccount: NearAccount = {
    keystore,
    accountId,
    signerId,
    publicKey,
    caipChainId,
    privateKey,
  }

  const doesAccountExist = await nearDoesAccountExist({
    chainMetadatas,
    nearAccountPointer: nearAccount,
    caipChainId,
  })

  if (!doesAccountExist) {
    __DEV__ &&
      // eslint-disable-next-line no-console
      console.log(
        `🛰️ Detected that the NearAccount does not exist. Attempting instantiation...`
      )

    await nearInstantiateAccount({ chainMetadatas, nearAccount })
  }

  return nearAccount
}

export async function getNearAccountForWalletConnectRequestOrThrow({
  chainMetadatas,
  web3wallet,
  request,
  walletsData,
}: {
  readonly chainMetadatas: ChainMetadatas
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<NearAccount> {
  const maybeNearAccount: NearAccount | undefined =
    await getMaybeNearAccountForWalletConnectRequest({
      chainMetadatas,
      web3wallet,
      request,
      walletsData,
    })

  if (!maybeNearAccount)
    throw new Error(`Unable to determine NearAccount for request.`)

  return maybeNearAccount
}
