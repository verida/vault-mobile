import { config as appConfig } from 'config'

// TODO: Infer the type from a zod schema
export type ForcedUpgradeType = {
  minVersion: string
  storeUrl: string
  required?: boolean
  message?: string
  furtherInfo?: string
}

// TODO: Infer the type from a zod schema
export type ForcedCreateAccountType = {
  required: boolean
  message: string
  furtherInfo?: string
}

// TODO: Infer the type from a zod schema
export type MaintenanceMode = {
  status: 'enabled' | 'disabled'
  message: string
  startTime?: string
  expectedEndTime?: string
  link?: string // blog post
}

// TODO: Infer the type from a zod schema
export type AppConfig = typeof appConfig

export interface ConfigContextType {
  config: AppConfig
  forcedUpgrade?: ForcedUpgradeType
  forcedCreateAccount?: ForcedCreateAccountType
}
