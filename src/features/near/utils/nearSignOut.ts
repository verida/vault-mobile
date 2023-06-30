import Sentry from '@sentry/react-native'
import {
  nearCreateTransactions,
  NearKeystore,
  NearNetworkId,
  nearSignAndSendTransactions,
  NearWalletAccountInfo,
} from 'features/near'
import { providers, transactions, utils } from 'near-api-js/lib'

export async function nearSignOut({
  accounts,
  provider,
  keystore,
  nearNetworkId,
}: {
  readonly accounts: readonly NearWalletAccountInfo[]
  readonly provider: providers.Provider
  readonly keystore: NearKeystore
  readonly nearNetworkId: NearNetworkId
}): Promise<readonly NearWalletAccountInfo[]> {
  return (
    await Promise.all(
      accounts.map(async (account) => {
        try {
          const [transaction] = await nearCreateTransactions({
            account,
            provider,
            transactions: [
              {
                signerId: account.accountId,
                receiverId: account.accountId,
                actions: [
                  transactions.deleteKey(
                    utils.PublicKey.from(account.publicKey)
                  ),
                ],
              },
            ],
          })

          await nearSignAndSendTransactions({
            transactions: [transaction],
            provider,
            nearNetworkId,
            keystore,
          })

          // TODO: I am copying this logic. Is this correct for the error response?
          //       https://github.com/verida/vault-mobile/blob/4f422accde253ced426ee25de5000ef5eeb2543d/src/wallet-connect/controllers/near.ts#L341
          return null
        } catch (e) {
          Sentry.captureException(e)
          // eslint-disable-next-line no-console
          console.log(
            `Failed to remove FunctionCall access key for ${account.accountId}`
          )

          // TODO: I am copying this logic. Is this correct for the error response?
          //       https://github.com/verida/vault-mobile/blob/4f422accde253ced426ee25de5000ef5eeb2543d/src/wallet-connect/controllers/near.ts#L349
          return account
        }
      })
    )
  ).flatMap((e) => (e ? [e] : []))
}
