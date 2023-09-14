import { PublicProfile } from 'features/profiles'

export type Account = {
  did: string
  privateKey: string
  mnemonic: string
  publicProfile?: PublicProfile
  seedPhraseReminder: {
    lastTime?: number
    backedup: boolean
  }
}

export type NormalizedAccounts = {
  [k: string]: Account
}
