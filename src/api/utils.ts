import axios from 'axios'
import { setNewMessagesCount } from 'features/inbox'
import { Logger } from 'features/telemetry'
import { isValidVeridaDid } from 'features/verida'
import { throttle } from 'lodash'
import { store } from 'reduxStore'

import AccountManager from 'api/AccountManager'
import { VERIDA_VAULT_CONTEXT_NAME } from 'constants/application'

const logger = new Logger('Utils')

const MAX_MESSAGE_COUNT = 21
export const DefaultAvatar = require('../assets/stubs/avatar.png')

/**
 * This function can be triggered in many situations(app state changes, the home screen got focus, got inbox notifications)
 * So we add debounce to help reduce duplicated calls
 * TODO: should handle fetch inbox count in a single place
 */
export const fetchInboxCount = throttle(
  async () => {
    try {
      const messages =
        await AccountManager.getInstance().vault?.inbox.fetchLatest(
          { read: false },
          { limit: MAX_MESSAGE_COUNT }
        )
      store.dispatch(setNewMessagesCount(messages?.length ?? 0))
    } catch (error) {
      logger.error(error)
    }
  },
  3000,
  { leading: true, trailing: false }
)

// TODO: De-duplicate all the get profile functions and move to features/profiles/utils
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
    logger.error(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}

// TODO: De-duplicate all the get profile functions and move to features/profiles/utils
export async function getPublicProfile(
  did: string,
  contextName: string = VERIDA_VAULT_CONTEXT_NAME
) {
  try {
    if (!isValidVeridaDid(did)) {
      // No need to try get the public profile of a non-Verida DID.

      // TODO: Report the DID to the telemetry so that we can plan on supporting the DID method but for the moment our telemetry quota is limited

      return {
        name: 'Unknown',
        avatar: DefaultAvatar,
      }
    }

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
    logger.error(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}

// TODO: De-duplicate all the get profile functions and move to features/profiles/utils
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
  } catch (error) {
    // User may not have created a profile
    logger.warn('Failed to get profile, or no profile found', { did })
    return {}
  }
}

export async function getAxios() {
  const fetchConfig: any = {
    headers: {
      'context-name': VERIDA_VAULT_CONTEXT_NAME,
    },
  }

  const currentDid = AccountManager.getInstance()
    .getSelectedAccount()
    ?.did.toLowerCase()

  const keyring = await AccountManager.getInstance()
    .context?.getAccount()
    .keyring(VERIDA_VAULT_CONTEXT_NAME)
  const axiosAuthPassword = await keyring?.sign(
    `Access the notification service using context: "${VERIDA_VAULT_CONTEXT_NAME}"?\n\n${currentDid}`
  )

  fetchConfig.auth = {
    username: currentDid?.replace(/:/g, '_'),
    password: axiosAuthPassword,
  }

  return axios.create(fetchConfig)
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
        context: VERIDA_VAULT_CONTEXT_NAME,
        deviceId: token,
      },
    }

    const axiosInstance = await getAxios()
    await axiosInstance.post(`${notificationServerUrl}/register`, body)
  } catch (error) {
    logger.error(error)
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
        context: VERIDA_VAULT_CONTEXT_NAME,
        deviceId: token,
      },
    }

    const axiosInstance = await getAxios()
    await axiosInstance.post(`${notificationServerUrl}/unregister`, body)
  } catch (error) {
    logger.error(error)
  }
}

export async function fetchConfigJson<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url + `?t=${Date.now()}`)
    const json = await res.json()
    return json
  } catch (error) {
    logger.error(error)
    return []
  }
}
