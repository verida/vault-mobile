import * as Sentry from '@sentry/react-native'
import AccountManager, {
  VERIDA_CONTEXT_NAME,
  VERIDA_TESTNET_NOTIFICATION_SERVER,
} from 'api/AccountManager'
import { setNewMessagesCount } from 'reduxStore/general/actions'
import store from 'reduxStore'
import axios from 'axios'

const MAX_MESSAGE_COUNT = 21
export const DefaultAvatar = require('../assets/stubs/avatar.png')

let axiosAuthPassword: string | undefined

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

export async function fetchInboxCount() {
  try {
    const messages =
      await AccountManager.getInstance().vault?.inbox.fetchLatest(
        { read: false },
        { limit: MAX_MESSAGE_COUNT }
      )
    store.dispatch(setNewMessagesCount(messages.length))
  } catch (error) {
    Sentry.captureException(error)
    console.log(error)
  }
}

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
    console.error(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}

export async function getAxios() {
  const config: any = {
    headers: {
      'context-name': VERIDA_CONTEXT_NAME,
    },
  }

  const currentDid = AccountManager.getInstance().getSelectedAccount()?.did

  if (!axiosAuthPassword) {
    const keyring = await AccountManager.getInstance()
      .context?.getAccount()
      .keyring(VERIDA_CONTEXT_NAME)
    axiosAuthPassword = await keyring?.sign(
      `Access the notification service using context: "${VERIDA_CONTEXT_NAME}"?\n\n${currentDid}`
    )
  }
  config.auth = {
    username: currentDid?.replace(/:/g, '_'),
    password: axiosAuthPassword,
  }

  return axios.create(config)
}

export async function registerRemoteNotification(token: string) {
  if (!token) {
    return
  }

  try {
    const currentDid = AccountManager.getInstance().getSelectedAccount()?.did
    const body = {
      data: {
        did: currentDid,
        context: VERIDA_CONTEXT_NAME,
        deviceId: token,
      },
    }

    const axiosInstance = await getAxios()
    await axiosInstance.post(
      `${VERIDA_TESTNET_NOTIFICATION_SERVER}/register`,
      body
    )
  } catch (e) {
    console.error(e)
    Sentry.captureException(e)
  }
}
