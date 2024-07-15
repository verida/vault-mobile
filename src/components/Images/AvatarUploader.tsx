import * as ImagePicker from 'expo-image-picker'
import React, { ComponentProps, FC, useCallback, useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import PhotoCameraSvg from '~/assets/photo-camera.svg'
import { ShimmerPlaceholder } from '~/components/ShimmerPlaceholder'
import { selectSelectedAccount } from '~/features/identities'
import {
  fetchPublicProfileData,
  selectPublicProfilesLoadingState,
  selectSelectedPublicProfile,
  setPublicProfileByDid,
} from '~/features/profiles'
import { Logger } from '~/features/telemetry'
import { useThemeAwareStyle } from '~/hooks'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

import { IdentityAvatar } from './IdentityAvatar'

const logger = Logger.create('Components/AvatarUploader')

export type AvatarUploaderProps = ComponentProps<typeof View>

// TODO: Move most of the logic into a dedicated hook and utility functions
// Keep in this file only the UI logic
export const AvatarUploader: FC<AvatarUploaderProps> = (props) => {
  const { ...viewProps } = props

  const dispatch = useAppDispatch()

  const selectedAccount = useAppSelector(selectSelectedAccount)
  const did = selectedAccount?.did

  const publicProfile = useAppSelector(selectSelectedPublicProfile)

  const loadingState = useAppSelector((state) =>
    selectPublicProfilesLoadingState(state, did)
  )

  useEffect(() => {
    if (did) {
      dispatch(fetchPublicProfileData(did))
    }
  }, [did, dispatch])

  const handleAvatarPress = useCallback(async () => {
    try {
      if (!did) {
        // Unlikely as this component is supposed to be used only when an identity is selected
        return
      }

      logger.debug('Launching image picker')
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.1,
        base64: true,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        logger.debug('Image picking cancelled')
        return
      }

      logger.debug('Image picked successfully')
      const asset = result.assets[0]
      const avatar = {
        uri: `data:${asset.mimeType};base64,` + asset.base64,
      }

      logger.debug('Saving new avatar to the vault')
      const vault = AccountManager.getInstance().vault as any // TODO: Improve typing
      await vault.profiles.public.set('avatar', avatar)
      logger.debug('Avatar saved to the vault')

      logger.debug('Dispatching updated public profile to Redux store')
      dispatch(
        setPublicProfileByDid({
          did,
          publicProfile: { ...publicProfile, avatar },
        })
      )
    } catch (error) {
      logger.error(error)
    }
  }, [did, dispatch, publicProfile])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <ShimmerPlaceholder
          visible={!loadingState.loading}
          width={120} // Must be the same as width in styles.avatar
          height={120} // Must be the same as height in styles.avatar
          shimmerStyle={styles.avatarShimmer}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}>
            <IdentityAvatar
              source={publicProfile?.avatar}
              style={styles.avatar}
            />
            <PhotoCameraSvg style={styles.svg} />
          </TouchableOpacity>
        </ShimmerPlaceholder>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    avatarContainer: {
      alignItems: 'center',
    },
    avatarShimmer: {
      borderRadius: theme.roundness.full,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: theme.roundness.full,
    },
    svg: {
      position: 'absolute',
      bottom: 27,
    },
  })
