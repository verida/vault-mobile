import { ImageSourcePropType } from 'react-native'

export type Account = {
  did: string
  mnemonic: string
  publicProfile?: UserData
  seedPhraseReminder: {
    lastTime?: number
    backedup: boolean
  }
}

export type UserData = {
  name: string
  country: string
  avatar?: ImageSourcePropType
  description?: string
}

export type NormalizedAccounts = {
  [k: string]: Account
}

export type NetworkNode = {
  node_code: string
  name: string
  description: string
  ISO2_CC: string
  address: string
  icon?: string
}

export type Network = {
  name: string
  default_node_code: string
  nodes: NetworkNode[]
  selected_node?: number
}

export type NetworkCountry = {
  [key: string]: string
}

export type NetworkCountries = {
  [name: string]: NetworkCountry[]
}
