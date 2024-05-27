import { Currency } from '~/features/cryptoWallet'

export enum CurrencyFormat {
  CRYPTO = 'crypto',
  FIAT = 'fiat',
}

type AbstractAmount<Units> = {
  readonly amount: `${number}`
  readonly units: Units
}

export type AmountWithMaybeCurrency = AbstractAmount<Currency | null>
export type AmountWithSymbol = AbstractAmount<string>
