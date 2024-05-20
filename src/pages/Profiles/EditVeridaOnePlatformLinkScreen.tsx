import React, { useCallback, useEffect, useRef } from 'react'
import { Alert, Keyboard, StyleSheet, TouchableOpacity } from 'react-native'

import { Icon, ScreenWrapper } from '~/components'
import {
  EnterPlatformLinkView,
  EnterPlatformLinkViewRefProps,
} from '~/components/PublicProfile'
import { HIT_SLOP_10_10 } from '~/constants'
import { useTheme } from '~/contexts'
import { Logger } from '~/features/telemetry'
import {
  VeridaOnePlatformLink,
  VeridaOnePlatformLinkCategory,
  VeridaOnePlatformMetadata,
  VeridaOnePlatforms,
} from '~/features/veridaOne'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { Theme } from '~/styles/types'

import { PublicProfileEditMode } from './PublicProfileScreen'

const logger = Logger.create('Pages/Profiles/EditPlatformLink')

export type EditVeridaOnePlatformLinkScreenParams = {
  screenName: string
  mode: string | number
  originalValue?: any
  selectedPlatform: VeridaOnePlatformMetadata
  platform: VeridaOnePlatforms
}

type EditVeridaOnePlatformLinkScreenProps =
  MainStackScreenProps<'EditVeridaOnePlatformLink'>

export const EditVeridaOnePlatformLinkScreen: React.FunctionComponent<
  EditVeridaOnePlatformLinkScreenProps
> = (props) => {
  const { navigation, route } = props
  const { screenName, mode, platform, selectedPlatform, originalValue } =
    route.params

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)
  const enterPlatformLinkPageRef = useRef<EnterPlatformLinkViewRefProps>(null)

  const onSaveSocialNetworkHandle = useCallback(
    (url: string) => {
      try {
        Keyboard.dismiss()
        if (!url?.length) {
          Alert.alert('Error', 'The URL must not be empty')
        }

        const cleanUrl = url.replace(/(\s)|(\/+$)/, '')
        const cleanUsername = cleanUrl.split('/').pop()

        const val: VeridaOnePlatformLink = {
          category: VeridaOnePlatformLinkCategory.SOCIAL,
          url: cleanUrl,
          platform: platform,
          accountId: cleanUsername!,
          order: 0,
        }

        emitter.emit('SAVE_GENERIC_PROPERTY', {
          screenName,
          value: val,
          mode,
          originalValue,
        })

        navigation.goBack()
      } catch (error) {
        logger.error(error)
      }
    },
    [mode, navigation, originalValue, platform, screenName]
  )

  const isEditMode = useCallback(() => !!originalValue?.url, [originalValue])

  const handleDeleteButtonPress = useCallback(() => {
    Alert.alert('Are you sure you want to delete this social?', undefined, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          emitter.emit('SAVE_GENERIC_PROPERTY', {
            screenName,
            value: originalValue,
            mode: PublicProfileEditMode.DeletePlatformURL,
            originalValue,
          })
          navigation.goBack()
        },
      },
    ])
  }, [navigation, originalValue, screenName])

  useEffect(() => {
    navigation.setOptions({
      title: `Edit ${selectedPlatform.label}`,
      headerRight: isEditMode()
        ? () => (
            <TouchableOpacity
              onPress={handleDeleteButtonPress}
              hitSlop={HIT_SLOP_10_10}
              style={styles.headerDeleteButton}>
              <Icon name='delete' size={24} color={theme.color.primary} />
            </TouchableOpacity>
          )
        : undefined,
    })
  }, [
    navigation,
    selectedPlatform.label,
    isEditMode,
    handleDeleteButtonPress,
    theme.color.primary,
    styles.headerDeleteButton,
  ])

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <EnterPlatformLinkView
        ref={enterPlatformLinkPageRef}
        platformLink={selectedPlatform}
        onSaveSocialNetworkHandle={onSaveSocialNetworkHandle}
        originalValue={originalValue}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerDeleteButton: {
      marginRight: theme.spacing.m,
    },
    container: {
      flex: 1,
    },
  })
