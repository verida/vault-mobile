import { z } from 'zod'

import { BaseCryptoWalletSchema, CryptoWalletRecordSchema } from '../schemas'

export type BaseCryptoWallet = z.infer<typeof BaseCryptoWalletSchema>

export type CryptoWalletRecord = z.infer<typeof CryptoWalletRecordSchema>

export type CreateCryptoWalletData = Partial<
  Pick<BaseCryptoWallet, 'label' | 'walletType' | 'mnemonic'>
>

export type ImportCryptoWalletData = Partial<
  Pick<BaseCryptoWallet, 'label' | 'walletType' | 'mnemonic' | 'privateKey'>
>

export type AddWatchedCryptoWallet = Partial<Pick<BaseCryptoWallet, 'label'>> &
  Required<Pick<BaseCryptoWallet, 'walletType' | 'address'>>

export type UpdateCryptoWalletData = Partial<Pick<BaseCryptoWallet, 'label'>>
