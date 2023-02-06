import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Sentry from '@sentry/react-native'

const edit = (navigation: any, option: any) =>
  navigation.navigate('EditProfile', { title: option.label, option })
export const editable = (list: any) =>
  list.map((option: any) => ({
    ...option,
    onPress: (navigation: any) =>
      option.onPress ? option.onPress(option) : edit(navigation, option),
  }))

// Hardcode Verida one invite code
export const VERIDA_ONE_INVITE_CODE = 'veridaonealpha'
const VERIDA_ONE_INVITE_STORAGE_KEY = 'veridaOneInviteStatus'
const VERIDA_ONE_ENABLED_VALUE = 'veridaOneEnabled'
export const checkVeridaOneInviteCode = (inputCode: string) =>
  inputCode?.trim().toLowerCase() === VERIDA_ONE_INVITE_CODE.toLowerCase()

export const isEnabledVeridaOneProfile = async () => {
  try {
    const statusStr = await AsyncStorage.getItem(VERIDA_ONE_INVITE_STORAGE_KEY)
    return statusStr === VERIDA_ONE_ENABLED_VALUE
  } catch (error) {
    Sentry.captureException(error)
  }

  return false
}

export const saveStatusEnabledVeridaOneProfile = async (enabled: boolean) => {
  enabled
    ? await AsyncStorage.setItem(
        VERIDA_ONE_INVITE_STORAGE_KEY,
        VERIDA_ONE_ENABLED_VALUE
      )
    : await AsyncStorage.removeItem(VERIDA_ONE_INVITE_STORAGE_KEY)
}
