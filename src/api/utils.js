import * as Sentry from '@sentry/react-native'
import AccountManager from 'api/AccountManager'

const DefaultAvatar = require('../assets/stubs/avatar.png')

export const loadAvatarSource = async () => {
  try {
    const vault = await AccountManager.getInstance().vault
    let avatar = await vault.profiles.public.get('avatar')
    if (!avatar) {
      return DefaultAvatar
    }

    avatar = JSON.parse(avatar)

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

    return DefaultAvatar
  } catch (error) {
    Sentry.captureException(error)
    return DefaultAvatar
  }
}
