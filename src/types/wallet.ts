import { SupportedCaipNamespace } from 'features/caip'

export type VeridaWalletType = 'single' | 'multi'

export interface VeridaWalletAccount {
  address: string
  chain: string
  did?: string
  mnemonic: string
  privateKey: string
  publicKey: string
}

export type VeridaWalletAccounts = Record<
  // HACK: There are also some deprecated standards, such as algorand, which may
  //       appear in an instance of VeridaWalletAccounts. Please take
  //       "SupportedCaipProtocolStandard" with a grain of salt here.
  SupportedCaipNamespace,
  VeridaWalletAccount
>

export interface VeridaWallet {
  label: string
  privateKey: string
  seedPhrase: string
  type: VeridaWalletType
  accounts: VeridaWalletAccounts
}
