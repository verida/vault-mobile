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

// ------ To refactor ------

export type BlockchainAccount = {
  privateKey?: string
  address?: string
  chainId?: string
}

export type BlockchainWalletWithAccounts = {
  _id: string
  label: string
  viewOnly?: boolean
  walletType: WalletType
  address?: string
  mnemonic?: string
  accounts: Record<string, BlockchainAccount>
  icon?: string
  count?: number
}

type AbstractMinifiedBlockchainAccount<Namespace extends BlockchainNamespace> =
  {
    readonly address: string
    readonly namespace: Namespace
  }

export type MinifiedBlockchainAccountEip155 =
  AbstractMinifiedBlockchainAccount<'eip155'> & {
    readonly privateKey: string
  }

export type MinifiedBlockchainAccountNear =
  AbstractMinifiedBlockchainAccount<'near'> & {
    readonly privateKey: string
  }

export type MinifiedBlockchainAccount =
  | MinifiedBlockchainAccountEip155
  | MinifiedBlockchainAccountNear

export type MinifiedBlockchainAccounts = readonly MinifiedBlockchainAccount[]
