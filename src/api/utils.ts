import { setNewMessagesCount } from 'features/inbox'
import { getProfilesCache } from 'features/profiles'
import { Logger } from 'features/telemetry'
import { isValidVeridaDid } from 'features/verida'
import { emitter } from 'helpers'
import { throttle } from 'lodash'
import { ImageSourcePropType } from 'react-native'
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

export async function getPublicProfile(
  did: string,
  contextName: string = VERIDA_VAULT_CONTEXT_NAME,
  fallbackToVeridaContext = true
): Promise<{
  name: string
  avatar: ImageSourcePropType
  isLoading?: boolean // For showing loading shimmers on the profile components
}> {
  const profileCache = getProfilesCache()

  if (!isValidVeridaDid(did)) {
    // No need to try get the public profile of a non-Verida DID.

    // TODO: Report the DID to the telemetry so that we can plan on supporting the DID method but for the moment our telemetry quota is limited
    return {
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }

  const profileId = `${contextName}-${did}`
  const loadedProfile = profileCache.get(profileId)?.value

  const shouldRefetchProfile =
    Date.now() - (profileCache.get(profileId)?.timestamp ?? 0) > 10 * 60 * 1000 // 10 minutes

  async function fetchPublicProfileAndUpdateCache() {
    try {
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

      profileCache.set(profileId, {
        name: name || 'Unknown',
        avatar: avatar || DefaultAvatar,
        ...profileData,
      })

      emitter.emit('PUBLIC_PROFILE_LOADED', {
        profileId,
      })
    } catch (error) {
      logger.error(error)
      return {
        name: 'Unknown',
        avatar: DefaultAvatar,
      }
    }
  }

  if (loadedProfile) {
    shouldRefetchProfile && fetchPublicProfileAndUpdateCache()
    return loadedProfile as any
  } else {
    fetchPublicProfileAndUpdateCache()
    return {
      isLoading: true,
      name: 'Unknown',
      avatar: DefaultAvatar,
    }
  }
}
