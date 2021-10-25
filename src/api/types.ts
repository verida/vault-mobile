import { ImageSourcePropType } from 'react-native'

export type Account = {
  did: string
  mnemonic: string
  privateKey: string
  publicProfile?: UserData
}

export type UserData = {
  name: string
  country: string
  avatar?: ImageSourcePropType
}

export type NormalizedAccounts = {
  [k: string]: Account
}
