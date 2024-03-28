import axios from 'axios'
import { Logger } from 'features/telemetry'

import AccountManager from 'api/AccountManager'
import { VERIDA_VAULT_CONTEXT_NAME } from 'constants/application'

const logger = Logger.create('Motifications')

// TODO: This whole file could be moved to hooks

async function getAxios() {
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
