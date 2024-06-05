import Clipboard from '@react-native-clipboard/clipboard'
import { isEmpty } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import ClipboardIcon from '~/assets/clipboard_icon.svg'
import { BottomActionBar, Icon, ScreenWrapper } from '~/components'
import Button from '~/components/Button'
import { FormInput } from '~/components/Input/FormInput'
import { Text } from '~/components/Typography/Text'
import { HIT_SLOP_10_10 } from '~/constants'
import { DECLINE_COLOR } from '~/constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '~/constants/text'
import { useTheme } from '~/contexts'
import { Logger } from '~/features/telemetry'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { Theme } from '~/styles/types'

import { PublicProfileEditMode } from './PublicProfileScreen'

const logger = Logger.create('Pages/AddCustomLink')

export type AddVeridaOneCustomLinkScreenParams = {
  screenName: string
  title?: string
  label?: string
  url?: string
  mode: string | number
  originalValue?: any
  submitButtonLabel?: string
  verification?: {
    expectedValue: string
    errorMessage: string
  }
}

type AddVeridaOneCustomLinkScreenProps =
  MainStackScreenProps<'AddVeridaOneCustomLink'>

export const AddVeridaOneCustomLinkScreen: React.FC<
  AddVeridaOneCustomLinkScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const {
    screenName,
    title,
    label,
    url,
    mode,
    originalValue,
    submitButtonLabel = 'Save',
  } = params

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const [labelInput, setLabelInput] = useState<string>(
    originalValue?.label ?? ''
  )
  const [urlInput, setUrlInput] = useState<string>(originalValue?.url ?? '')

  const saveValue = useCallback(async () => {
    try {
      Keyboard.dismiss()

      const val = { label: labelInput, url: urlInput }

      emitter.emit('SAVE_GENERIC_PROPERTY', {
        screenName,
        title,
        value: val,
        mode,
        originalValue,
      })

      navigation.goBack()
    } catch (error) {
      logger.error(error)
    }
  }, [labelInput, mode, navigation, originalValue, screenName, title, urlInput])

  const isEditMode = useCallback(
    () => !isEmpty(label) && !isEmpty(url),
    [label, url]
  )

  const handleDeleteButtonPress = useCallback(() => {
    Alert.alert('Are you sure you want to delete this link?', undefined, [
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
            title,
            value: originalValue,
            mode: PublicProfileEditMode.DeleteCustomURL,
            originalValue,
          })
          navigation.goBack()
        },
      },
    ])
  }, [navigation, originalValue, screenName, title])

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode() ? 'Edit Link' : 'Add New Link',
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
    isEditMode,
    handleDeleteButtonPress,
    styles.headerDeleteButton,
    theme.color.primary,
  ])

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <View style={styles.constainer}>
        <FormInput
          label='Label'
          placeholder='Enter label'
          autoComplete='off'
          autoCorrect={false}
          value={labelInput}
          onChangeText={(text) => setLabelInput(text)}
        />
        <FormInput
          style={{ marginTop: 16 }}
          label='URL'
          autoCapitalize='none'
          autoComplete='off'
          autoCorrect={false}
          keyboardType='url'
          value={urlInput}
          onChangeText={(text) => setUrlInput(text)}
          placeholder='Enter URL'
        />

        <Button
          color='transparent-link'
          onPress={async () => {
            const text = await Clipboard.getString()
            setUrlInput(text)
          }}>
          <View style={styles.clipboardPasteButton}>
            <ClipboardIcon />
            <Text style={styles.clipboardPasteButtonText}>
              Paste from clipboard
            </Text>
          </View>
        </Button>
      </View>
      <BottomActionBar
        actions={[
          {
            label: submitButtonLabel,
            onPress: saveValue,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerDeleteButton: {
      marginRight: theme.spacing.m,
    },
    constainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
    },
    inputValidation: {
      borderColor: DECLINE_COLOR,
    },
    inputText: {
      fontFamily: NUNITO_SANS,
      color: DECLINE_COLOR,
      fontStyle: 'italic',
      fontSize: 12,
      marginVertical: 4,
    },
    clipboardPasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    clipboardPasteButtonText: {
      color: theme.color.primary,
      marginLeft: theme.spacing.sm,
      fontFamily: NUNITO_SANS_BOLD,
    },
  })
