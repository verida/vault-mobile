import { IWeb3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { maybeParseCaip, SupportedCaipProtocolStandard } from 'features/caip'
import {
  getNearAccountId,
  NearAccount,
  nearDoesAccountExist,
  nearInstantiateAccount,
  throwIfNotNearTestnet,
} from 'features/near'
import { useWalletsData } from 'hooks'
import { keyStores, utils } from 'near-api-js'

import { getMaybeVeridaWalletAccountForWalletConnectRequest } from './getMaybeVeridaWalletAccountForWalletConnectRequest'

// https://docs.near.org/tools/near-api-js/quick-reference#key-store
export async function getMaybeNearAccountForWalletConnectRequest({
  web3wallet,
  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<NearAccount | undefined> {
  const { params } = request

  const maybeParsedCaip = maybeParseCaip(params.chainId)

  if (
    !maybeParsedCaip ||
    maybeParsedCaip.standard !== SupportedCaipProtocolStandard.NEAR
  )
    return undefined

  if (!throwIfNotNearTestnet(maybeParsedCaip)) return undefined

  const maybeVeridaWalletAccount =
    getMaybeVeridaWalletAccountForWalletConnectRequest({
      web3wallet,
      request,
      walletsData,
    })

  if (!maybeVeridaWalletAccount) return undefined

  const { privateKey, address: signerId } = maybeVeridaWalletAccount

  const { chainId } = maybeParsedCaip

  const keyPair = utils.KeyPair.fromString(privateKey)

  const publicKey = keyPair.getPublicKey().toString()

  const keystore = new keyStores.InMemoryKeyStore()

  // HACK: Deterministic account creation.
  const accountId = getNearAccountId({
    signerId,
  })

  await keystore.setKey(chainId, accountId, keyPair)

  const nearAccount: NearAccount = {
    keystore,
    accountId,
    signerId,
    publicKey,
    parsedCaipType: maybeParsedCaip,
    privateKey,
  }

  const doesAccountExist = await nearDoesAccountExist({
    nearAccountPointer: nearAccount,
    parsedCaipType: maybeParsedCaip,
  })

  if (!doesAccountExist) {
    __DEV__ &&
      // eslint-disable-next-line no-console
      console.log(
        `🛰️ Detected that the NearAccount does not exist. Attempting instantiation...`
      )

    await nearInstantiateAccount(nearAccount)
  }

  return nearAccount
}

export async function getNearAccountForWalletConnectRequestOrThrow({
  web3wallet,
  request,
  walletsData,
}: {
  readonly web3wallet: IWeb3Wallet
  readonly request: Web3WalletTypes.EventArguments['session_request']
  readonly walletsData: ReturnType<typeof useWalletsData>
}): Promise<NearAccount> {
  const maybeNearAccount: NearAccount | undefined =
    await getMaybeNearAccountForWalletConnectRequest({
      web3wallet,
      request,
      walletsData,
    })

  if (!maybeNearAccount)
    throw new Error(`Unable to determine NearAccount for request.`)

  return maybeNearAccount
}
