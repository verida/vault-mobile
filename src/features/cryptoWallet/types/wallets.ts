import { z } from 'zod'

import {
  BlockchainNetwork,
  SupportedBlockchainNamespace,
} from '~/features/blockchain'

import {
  BaseCryptoWalletRecordSchema,
  CryptoWalletRecordSchema,
} from '../schemas'

export type BaseCryptoWalletRecord = z.infer<
  typeof BaseCryptoWalletRecordSchema
>

export type CryptoWalletRecord = z.infer<typeof CryptoWalletRecordSchema>

export type CreateCryptoWalletData = Partial<
  Pick<BaseCryptoWalletRecord, 'label' | 'walletType' | 'mnemonic'>
>

export type ImportCryptoWalletData = Partial<
  Pick<
    BaseCryptoWalletRecord,
    'label' | 'walletType' | 'mnemonic' | 'privateKey'
  >
>

export type AddWatchedCryptoWallet = Partial<
  Pick<BaseCryptoWalletRecord, 'label'>
> &
  Required<Pick<BaseCryptoWalletRecord, 'walletType' | 'address'>>

export type UpdateCryptoWalletData = Partial<
  Pick<BaseCryptoWalletRecord, 'label'>
>

// ------

export type BlockchainAccount = {
  privateKey?: string
  address?: string
  publicKey?: string
  mnemonic?: string
  chainId?: string
  derivationPath?: string
  blockchainNetwork?: BlockchainNetwork
}

export type BlockchainWalletWithAccounts = {
  _id: string
  label: string
  multiChain: boolean
  viewOnly?: boolean
  walletType: string // "multi" for a multi coin, otherwise the CAIP chain reference (ie: "eip155:5")

  privateKey?: string
  address?: string
  publicKey?: string
  mnemonic?: string
  chainId?: string
  derivationPath?: string
  blockchainNetwork?: BlockchainNetwork

  accounts: Record<string, BlockchainAccount>

  // Transient fields for displaying
  icon?: string
  count?: number
}

// ------

type AbstractMinifiedBlockchainAccount<
  Namespace extends SupportedBlockchainNamespace,
> = {
  readonly address: string
  readonly namespace: Namespace
}

export type MinifiedBlockchainAccountEip155 =
  AbstractMinifiedBlockchainAccount<SupportedBlockchainNamespace.EIP_155> & {
    readonly privateKey: string
  }

export type MinifiedBlockchainAccountNear =
  AbstractMinifiedBlockchainAccount<SupportedBlockchainNamespace.NEAR> & {
    readonly privateKey: string
  }

export type MinifiedBlockchainAccount =
  | MinifiedBlockchainAccountEip155
  | MinifiedBlockchainAccountNear

export type MinifiedBlockchainAccounts = readonly MinifiedBlockchainAccount[]
