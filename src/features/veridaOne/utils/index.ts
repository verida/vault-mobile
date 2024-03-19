import AsyncStorage from '@react-native-async-storage/async-storage'
import { Logger } from 'features/telemetry'

import {
  VERIDA_ONE_INVITE_CODE,
  VERIDA_ONE_INVITE_STATUS_ENABLED_VALUE,
  VERIDA_ONE_INVITE_STATUS_STORAGE_KEY,
  VERIDA_ONE_WEBSITE,
} from '../constants'

const logger = Logger.create('VeridaOne')

export function verifyVeridaOneInviteCode(code: string) {
  return code?.trim().toLowerCase() === VERIDA_ONE_INVITE_CODE.toLowerCase()
}

export async function isVeridaOneEnabled() {
  try {
    const status = await AsyncStorage.getItem(
      VERIDA_ONE_INVITE_STATUS_STORAGE_KEY
    )
    return status === VERIDA_ONE_INVITE_STATUS_ENABLED_VALUE
  } catch (error) {
    logger.error(error)
  }

  return false
}

export async function saveVeridaOneStatus(enabled: boolean) {
  enabled
    ? await AsyncStorage.setItem(
        VERIDA_ONE_INVITE_STATUS_STORAGE_KEY,
        VERIDA_ONE_INVITE_STATUS_ENABLED_VALUE
      )
    : await AsyncStorage.removeItem(VERIDA_ONE_INVITE_STATUS_STORAGE_KEY)
}

export function getVeridaOneProfileUrl(didOrUsername: string) {
  return `${VERIDA_ONE_WEBSITE}/${didOrUsername}`
}
