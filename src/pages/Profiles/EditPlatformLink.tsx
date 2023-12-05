import { Logger } from 'features/telemetry'
import {
  VeridaOnePlatformLink,
  VeridaOnePlatformLinkCategory,
  VeridaOnePlatformMetadata,
  VeridaOnePlatforms,
} from 'features/veridaOne'
import { emitter } from 'helpers/emitter'
import React, { useRef } from 'react'
import { Alert, Keyboard, StyleSheet, View } from 'react-native'

import TrashBinIcon from 'assets/trash_bin_icon.svg'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import {
  EnterPlatformLinkView,
  EnterPlatformLinkViewRefProps,
} from 'components/PublicProfile'
import Screen from 'components/Screen'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import { PublicProfileEditMode } from './PublicProfile'

const logger = new Logger('Pages/Profiles/EditPlatformLink')

export interface EditPlatformLinkScreenParams {
  screenName: string
  mode: string | number
  originalValue?: any
  selectedPlatform: VeridaOnePlatformMetadata
  platform: VeridaOnePlatforms
}

type EditPlatformLinkScreenProps = MainStackScreenProps<'EditPlatformLink'>

const EditPlatformLink: React.FunctionComponent<EditPlatformLinkScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { screenName, mode, platform, selectedPlatform, originalValue } =
    route.params

  const styles = useThemeAwareStyle(createStyles)
  const enterPlatformLinkPageRef = useRef<EnterPlatformLinkViewRefProps>(null)
  const onSaveSocialNetworkHandle = (url: string) => {
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
  }

  const isEditMode = () => !!originalValue?.url

  return (
    <Screen
      navBar={
        <NavigationHeader
          title={`Edit ${selectedPlatform.label}`}
          left={{ icon: 'back' }}
          right={
            isEditMode()
              ? {
                  icon: <TrashBinIcon />,
                  action: () => {
                    Alert.alert(
                      'Are you sure you want to delete this social?',
                      undefined,
                      [
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
                      ]
                    )
                  },
                }
              : undefined
          }
        />
      }>
      <View style={styles.container}>
        <EnterPlatformLinkView
          ref={enterPlatformLinkPageRef}
          platformLink={selectedPlatform}
          onSaveSocialNetworkHandle={onSaveSocialNetworkHandle}
          originalValue={originalValue}
        />
      </View>
    </Screen>
  )
}

export default EditPlatformLink

const createStyles = (_: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  })
