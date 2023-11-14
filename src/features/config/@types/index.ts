import { config as appConfig } from 'config'

export type ForcedUpgradeType = {
  minVersion: string
  storeUrl: string
  required?: boolean
  message?: string
  furtherInfo?: string
}

export type ForcedCreateAccountType = {
  required: boolean
  message: string
  furtherInfo?: string
}

export type MaintenanceMode = {
  status: 'enabled' | 'disabled'
  message: string
  startTime?: string
  expectedEndTime?: string
  link?: string // blog post
}

export type AppConfig = typeof appConfig

export interface ConfigContextType {
  config: AppConfig
  forcedUpgrade?: ForcedUpgradeType
  forcedCreateAccount?: ForcedCreateAccountType
}
