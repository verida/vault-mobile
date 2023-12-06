import Clipboard from '@react-native-community/clipboard'
import { Logger } from 'features/telemetry'
import { emitter } from 'helpers/emitter'
import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { Alert, Keyboard, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import ClipboardIcon from 'assets/clipboard_icon.svg'
import TrashBinIcon from 'assets/trash_bin_icon.svg'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Text } from 'components/Typography/Text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import Button from '../../components/Button'
import { DECLINE_COLOR } from '../../constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from '../../constants/text'
import { PublicProfileEditMode } from './PublicProfileScreen'

const logger = new Logger('Pages/AddCustomLink')

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

export const AddVeridaOneCustomLinkScreen: React.FC<AddVeridaOneCustomLinkScreenProps> =
  (props) => {
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
    const { bottom } = useSafeAreaInsets()
    const [labelInput, setLabelInput] = useState(originalValue?.label ?? '')
    const [urlInput, setUrlInput] = useState(originalValue?.url ?? '')

    const saveValue = async () => {
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
    }

    const isEditMode = () => !isEmpty(label) && !isEmpty(url)

    return (
      <Screen withKeyboardAvoidingView>
        <NavigationHeader
          title={isEditMode() ? 'Edit Link' : 'Add New Link'}
          left={{
            icon: 'close',
          }}
          right={
            isEditMode()
              ? {
                  icon: <TrashBinIcon />,
                  action: () => {
                    Alert.alert(
                      'Are you sure you want to delete this link?',
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
                              title,
                              value: originalValue,
                              mode: PublicProfileEditMode.DeleteCustomURL,
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
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <View style={{ flexDirection: 'column' }}>
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
          <Button onPress={saveValue}>{submitButtonLabel}</Button>
        </View>
      </Screen>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    constainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
      justifyContent: 'space-between',
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
    description: {
      marginVertical: theme.spacing.xs,
      color: theme.color.textLightGrey,
      fontSize: theme.fontSize.s,
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
