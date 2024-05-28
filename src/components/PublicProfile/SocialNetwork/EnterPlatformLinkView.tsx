import Clipboard from '@react-native-clipboard/clipboard'
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import ClipboardIcon from '~/assets/clipboard_icon.svg'
import Button from '~/components/Button'
import { FormInput } from '~/components/Input/FormInput'
import { BottomActionBar } from '~/components/ScreenLayouts'
import { Caption } from '~/components/Typography/Caption'
import {
  VeridaOnePlatformLink,
  VeridaOnePlatformMetadata,
} from '~/features/veridaOne'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

const MAX_INPUT_LENGTH = 120
const MIN_USERNAME_LENGTH = 1
const USERNAME_PLACEHOLDER = 'username'

interface PageProps {
  onSaveSocialNetworkHandle: (url: string) => void
  platformLink: VeridaOnePlatformMetadata
  originalValue?: VeridaOnePlatformLink
}

export interface EnterPlatformLinkViewRefProps {
  focusInput: () => void
}

export const EnterPlatformLinkView = React.forwardRef(
  (
    { platformLink, originalValue, onSaveSocialNetworkHandle }: PageProps,
    receivedRef: React.ForwardedRef<EnterPlatformLinkViewRefProps>
  ) => {
    const styles = useThemeAwareStyle(createStyles)
    const [isValid, setIsValid] = useState(false)
    const [inputText, setInputText] = useState(platformLink.baseURL)

    const urlInputRef = useRef<TextInput>(null)
    useImperativeHandle(receivedRef, () => ({
      focusInput: () => {
        urlInputRef.current?.focus()
      },
    }))

    useEffect(() => {
      originalValue
        ? setInputText(originalValue.url)
        : setInputText(platformLink.baseURL)
    }, [platformLink, originalValue])

    useEffect(() => {
      // TODO: revisit, the validation for platform links must be more comprehensive, show user validation errors as well
      const countHttpsString = inputText?.match(/https/g)
      if (countHttpsString && countHttpsString.length > 1) {
        setIsValid(false)
        return
      }

      const cleanUrl = inputText
        ?.replace(platformLink.baseURL, '')
        ?.replace(/(\s)|(\/+$)/, '')
      const cleanUsername = cleanUrl?.split('/').pop()
      if (
        platformLink &&
        cleanUsername &&
        cleanUsername.length >= MIN_USERNAME_LENGTH
      ) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    }, [inputText, platformLink])

    if (!platformLink?.baseURL) return null

    return (
      <View key='EnterPlatformLink' style={styles.container}>
        <View style={styles.content}>
          <FormInput
            ref={urlInputRef}
            placeholder={`${platformLink.baseURL + USERNAME_PLACEHOLDER}`}
            label={`${platformLink.label} Account URL`}
            autoFocus={false}
            autoCorrect={false}
            keyboardType='url'
            autoComplete='off'
            autoCapitalize='none'
            returnKeyType='done'
            maxLength={platformLink.baseURL.length + MAX_INPUT_LENGTH}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text)
            }}
          />

          <Button
            color='transparent-link'
            onPress={async () => {
              const text = await Clipboard.getString()
              const cleanText = text.replace(platformLink.baseURL, '')
              setInputText(platformLink.baseURL + cleanText)
            }}>
            <View style={styles.clipboardPasteButton}>
              <ClipboardIcon />
              <Caption style={styles.clipboardPasteButtonText}>
                Paste from clipboard
              </Caption>
            </View>
          </Button>
        </View>
        <BottomActionBar
          actions={[
            {
              label: originalValue?.url ? 'Save' : 'Add',
              onPress: () => onSaveSocialNetworkHandle(inputText),
              disabled: !isValid,
            },
          ]}
        />
      </View>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: theme.spacing.m,
    },
    clipboardPasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    clipboardPasteButtonText: {
      color: theme.color.primary,
      fontSize: theme.fontSize.m,
      marginLeft: theme.spacing.sm,
    },
  })
