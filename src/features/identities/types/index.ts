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

export type MigrateIdentityStep =
  | 'createDID'
  | 'connectIdentity'
  | 'migrateData'

export type MigrateIdentityStepStatus =
  | 'idle'
  | 'processing'
  | 'success'
  | 'error'

export type UpdateMigrateStepStatusFunction = (
  step: MigrateIdentityStep,
  status: MigrateIdentityStepStatus
) => void
