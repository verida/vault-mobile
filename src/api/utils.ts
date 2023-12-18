import { config } from 'config'
import { setNewMessagesCount } from 'features/inbox'
import { Logger } from 'features/telemetry'
import { isValidVeridaDid } from 'features/verida'
import { throttle } from 'lodash'
import { store } from 'reduxStore'

import AccountManager from 'api/AccountManager'

const logger = new Logger('Utils')

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
    logger.error(error)
  }
}

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

// TODO: Cache external profiles so they don't need to be re-fetched?
export async function getPublicProfile(
  did: string,
  contextName: string = config.VERIDA_CONTEXT_NAME,
  fallbackToVeridaContext = true
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

    let publicProfile = await AccountManager.getInstance()
      .getClient()
      ?.openPublicProfile(did, contextName, 'basicProfile')
    let profileData: any = await publicProfile?.getMany({}, {})

    if ((!profileData || !profileData.name) && fallbackToVeridaContext) {
      // No valid profile found for the requested context, so fallback to default for the user
      publicProfile = await AccountManager.getInstance().context?.openProfile(
        'basicProfile',
        did
      )

      profileData = await publicProfile?.getMany({}, {})
    }

    const name = await publicProfile?.get('name')
    const avatar = await publicProfile?.get('avatar')

    return {
      name: name || 'Unknown',
      avatar: avatar || DefaultAvatar,
      ...profileData,
    }
  } catch (error) {
    logger.error(error)

    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
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
