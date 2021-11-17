import * as Sentry from '@sentry/react-native'
import AccountManager from 'api/AccountManager'
import { setNewMessagesCount } from 'reduxStore/general/actions'
import store from 'reduxStore'

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
    console.log('avatar:', avatar)
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
