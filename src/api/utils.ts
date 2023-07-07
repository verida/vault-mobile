import * as Sentry from '@sentry/react-native'
import axios from 'axios'
import { setNewMessagesCount } from 'features/inbox'
import { debounce } from 'lodash'
import { store } from 'reduxStore'

import AccountManager from 'api/AccountManager'

import CONFIG from '../config/environment'

const MAX_MESSAGE_COUNT = 21
export const DefaultAvatar = require('../assets/stubs/avatar.png')

export const convertAvatar = (avatar: any) => {
  if (!avatar) {
    return DefaultAvatar
  }

  if (avatar) {
    let image
    switch (avatar.encoding) {
      case 'base64':
        image = {
          uri: `data:image/${avatar.format};base64,` + avatar.base64,
        }

        break
      default:
        return DefaultAvatar
    }

    return image
  }
}

export const loadAvatarSource = async () => {
  try {
    const vault = await AccountManager.getInstance().vault
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const avatar = await vault?.profiles.public.get('avatar')

    if (avatar) {
      return avatar
    }

    return DefaultAvatar
  } catch (error) {
    Sentry.captureException(error)
  }
}

//@deprcated
export const fetchPublicProfileData = async () => {
  try {
    const accounts = { ...AccountManager.getInstance().accounts }
    await Promise.all(
      Object.values(accounts).map(async (account) => {
        const externalProfile =
          await AccountManager.getInstance().context?.openProfile(
            'basicProfile',
            account.did
          )

        const avatar = await externalProfile?.get('avatar')
        const name = await externalProfile?.get('name')
        const country = await externalProfile?.get('country')

        accounts[account.did].publicProfile = {
          avatar: avatar,
          name,
          country,
        }
      })
    )

    return accounts
  } catch (e) {
    Sentry.captureException(e)
    return AccountManager.getInstance().accounts
  }
}

/**
 * This function can be triggered in many situations(app state changes, the home screen got focus, got inbox notifications)
 * So we add debounce to help reduce duplicated calls
 * TODO: should handle fetch inbox count in a single place
 */
export const fetchInboxCount = debounce(async () => {
  try {
    const messages =
      await AccountManager.getInstance().vault?.inbox.fetchLatest(
        { read: false },
        { limit: MAX_MESSAGE_COUNT }
      )
    store.dispatch(setNewMessagesCount(messages?.length ?? 0))
  } catch (error) {
    Sentry.captureException(error)
  }
}, 2500)

export async function getProfile(did: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const publicProfile =
      await AccountManager.getInstance().context?.openProfile(
        'basicProfile',
        did
      )
    const name = await publicProfile?.get('name')
    const avatar = await publicProfile?.get('avatar')

    return {
      name: name || 'Unknown',
      avatar: avatar || DefaultAvatar,
    }
  } catch (error) {
    Sentry.captureException(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}

export async function getPublicProfile(
  did: string,
  contextName = CONFIG.VERIDA_CONTEXT_NAME
) {
  try {
    const publicProfile = await AccountManager.getInstance()
      .getClient()
      ?.openPublicProfile(did, contextName, 'basicProfile')
    const name = await publicProfile?.get('name')
    const avatar = await publicProfile?.get('avatar')

    return {
      name: name || 'Unknown',
      avatar: avatar || DefaultAvatar,
    }
  } catch (error) {
    Sentry.captureException(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}

// @todo: Add to vault common
export const getInboxProfile = async (did: string, context: string) => {
  const client = AccountManager.getInstance().client
  try {
    const profile = await client!.openPublicProfile(
      did,
      context,
      'basicProfile'
    )
    const profileData = await profile!.getMany({}, {})
    return profileData
  } catch (err) {
    // User may not have created a profile
    return {}
  }
}

export async function getAxios() {
  const config: any = {
    headers: {
      'context-name': CONFIG.VERIDA_CONTEXT_NAME,
    },
  }

  const currentDid = AccountManager.getInstance()
    .getSelectedAccount()
    ?.did.toLowerCase()

  const keyring = await AccountManager.getInstance()
    .context?.getAccount()
    .keyring(CONFIG.VERIDA_CONTEXT_NAME)
  const axiosAuthPassword = await keyring?.sign(
    `Access the notification service using context: "${CONFIG.VERIDA_CONTEXT_NAME}"?\n\n${currentDid}`
  )

  config.auth = {
    username: currentDid?.replace(/:/g, '_'),
    password: axiosAuthPassword,
  }

  return axios.create(config)
}

export async function getNotificationServerUrl() {
  // Notification server url is saved in account's config
  const accountConfig =
    await AccountManager.getInstance().context?.getContextConfig()
  // Notification server url is saved in account's config
  const notificationServerUrl =
    accountConfig?.services.notificationServer?.endpointUri[0]

  // Remove redundant "/" character at the end if it exists
  return notificationServerUrl?.replace(/\/$/, '')
}

export async function registerRemoteNotification(token: string) {
  if (!token) {
    return
  }

  try {
    const currentDid = AccountManager.getInstance().getSelectedAccount()?.did
    const notificationServerUrl = await getNotificationServerUrl()
    if (!notificationServerUrl) {
      return
    }

    const body = {
      data: {
        did: currentDid,
        context: CONFIG.VERIDA_CONTEXT_NAME,
        deviceId: token,
      },
    }

    const axiosInstance = await getAxios()
    await axiosInstance.post(`${notificationServerUrl}/register`, body)
  } catch (e) {
    Sentry.captureException(e)
  }
}

export async function unRegisterRemoteNotification(token: string) {
  try {
    const currentDid = AccountManager.getInstance().getSelectedAccount()?.did
    const notificationServerUrl = await getNotificationServerUrl()
    if (!notificationServerUrl) {
      return
    }

    const body = {
      data: {
        did: currentDid,
        context: CONFIG.VERIDA_CONTEXT_NAME,
        deviceId: token,
      },
    }

    const axiosInstance = await getAxios()
    await axiosInstance.post(`${notificationServerUrl}/unregister`, body)
  } catch (e) {
    Sentry.captureException(e)
  }
}

export async function fetchConfigJson<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url + `?t=${Date.now()}`)
    const json = await res.json()
    return json
  } catch (e) {
    Sentry.captureException(e)
    return []
  }
}

/**
 * Sleep for an exact amount of milliseconds
 * @param ms milliseconds
 * @return Promise
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Execute an async function and abort if it takes too much time
 * @param promise the async function
 * @param timeout timeout in milliseconds
 * @return type of return value from the async function or throw an error if aborted
 */
export async function execWithTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T | void> {
  return Promise.race([promise, sleep(timeout)])
}
