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
    readonly derivationIndex: number // Index of the account in the derivation path
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

// An account is technically tied to a given chain, so here, it's called "Account" but it's more like a namespace-level "account" holding the common private key and address for all chain references
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

// If we ever get rid of the "multi" wallet type, this CryptoWallet type can be merged with the CryptoWalletAccount type because the only reason `accounts` is an array is because of the "multi" wallet type.
// Note that getting rid of the "multi" wallet type means instead of having a single wallet with multiple accounts, we would have multiple wallets each with a single account.
export type CryptoWallet = {
  id: string
  label: string
  mnemonic?: string // How does it work for wallet imported with private keys?
  readOnly: boolean
  // icon?: string // Do we need an icon? No, because the persistence schema doesn't have it yet, and the goal of the `accounts` field is to be chain-agnostic, so we can't tie the wallet to a specific chain, so we can't get the icon from the chain.
  accounts: readonly CryptoWalletAccount[]
}

/**
 * @deprecated replace by CryptoWallet
 */
export type LegacyCryptoWallet = {
  _id: string
  label: string
  readOnly: boolean
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
