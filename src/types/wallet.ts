import { SupportedCaipNamespace } from 'features/caip'

import { BlockchainAccount } from 'api/types'

/**
 * @deprecated
 */
export type VeridaWalletType = 'single' | 'multi'

/**
 * @deprecated
 */
export type VeridaWalletAccount = BlockchainAccount

export type VeridaWalletAccounts = Record<
  // HACK: There are also some deprecated standards, such as algorand, which may
  //       appear in an instance of VeridaWalletAccounts. Please take
  //       "SupportedCaipProtocolStandard" with a grain of salt here.
  SupportedCaipNamespace,
  BlockchainAccount
>

/**
 * @deprecated
 */
export interface VeridaWallet {
  label: string
  privateKey: string
  seedPhrase: string
  type: VeridaWalletType
  accounts: VeridaWalletAccounts
}
