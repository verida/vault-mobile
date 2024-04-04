import { z } from 'zod'

import { SupportedBlockchainNamespace } from '~/features/blockchain'

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
  chainId?: string
}

export type BlockchainWalletWithAccounts = {
  _id: string
  label: string
  viewOnly?: boolean
  walletType: string // "multi" for a multi coin, otherwise the CAIP chain reference (ie: "eip155:5")
  address?: string
  mnemonic?: string
  accounts: Record<string, BlockchainAccount>
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
