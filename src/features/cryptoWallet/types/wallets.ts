import { z } from 'zod'

import { BlockchainNamespace } from '~/features/blockchain'

import { WALLET_TYPES } from '../constants'
import {
  BaseCryptoWalletRecordSchema,
  CryptoWalletRecordSchema,
} from '../schemas'

export type WalletType = (typeof WALLET_TYPES)[number]

export type BaseCryptoWalletRecord = z.infer<
  typeof BaseCryptoWalletRecordSchema
>

export type CryptoWalletRecord = z.infer<typeof CryptoWalletRecordSchema>

export type AbstractCryptoWalletAccount<Namespace extends BlockchainNamespace> =
  {
    // Intentionally not following accountId (CAIP-10) format as we want to dynamically adapt to multiple chainId references
    readonly namespace: Namespace
    readonly address: string
    // readonly derivationIndex: number // Index of the account in the derivation path
  }

export type CryptoWalletAccountEip155 =
  AbstractCryptoWalletAccount<'eip155'> & {
    // Specificities to eip155
    readonly privateKey: string
  }

export type CryptoWalletAccountNear = AbstractCryptoWalletAccount<'near'> & {
  // Specificities to near
  readonly privateKey: string
}

export type CryptoWalletAccount =
  | CryptoWalletAccountEip155
  | CryptoWalletAccountNear

export type CryptoWalletAccounts = readonly CryptoWalletAccount[]

/**
 * @deprecated replace by CryptoWalletAccount
 */
export type LegacyCryptoWalletAccount = {
  privateKey?: string
  address?: string
  chainId?: string
}

export type CryptoWallet = {
  id: string
  label: string
  mnemonic?: string
  accounts: readonly CryptoWalletAccount[]
}

export type BlockchainWalletWithAccounts = {
  _id: string
  label: string
  viewOnly?: boolean
  walletType: WalletType
  address?: string
  mnemonic?: string
  accounts: Record<string, LegacyCryptoWalletAccount>
  icon?: string
  count?: number
}

// --- Crypto requests

export type CreateCryptoWalletData = Partial<
  Pick<BaseCryptoWalletRecord, 'label' | 'walletType' | 'mnemonic'>
>

export type ImportCryptoWalletData = Partial<
  Pick<
    BaseCryptoWalletRecord,
    'label' | 'walletType' | 'mnemonic' | 'privateKey'
  >
>

export type AddWatchedCryptoWalletData = Partial<
  Pick<BaseCryptoWalletRecord, 'label'>
> &
  Required<Pick<BaseCryptoWalletRecord, 'walletType' | 'address'>>

export type UpdateCryptoWalletData = Partial<
  Pick<BaseCryptoWalletRecord, 'label'>
>
