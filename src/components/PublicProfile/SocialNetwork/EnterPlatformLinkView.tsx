import Clipboard from '@react-native-community/clipboard'
import { useTheme } from 'contexts/ThemeContext'
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { VeridaOnePlatformLink } from 'api/types'
import ClipboardIcon from 'assets/clipboard_icon.svg'
import Button from 'components/Button'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import { Caption } from 'components/Typography/Caption'
import { PlatformLinkData } from 'constants/profile'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const MAX_INPUT_LENGTH = 120
const MIN_USERNAME_LENGTH = 1
const USERNAME_PLACEHOLDER = 'username'

interface PageProps {
  onSaveSocialNetworkHandle: (url: string) => void
  platformLink: PlatformLinkData
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
    const { bottom, top } = useSafeAreaInsets()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
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
      <Container
        key={'EnterPlatformLink'}
        withKeyboardAvoidingView
        keyboadAvoidingViewProps={{ keyboardVerticalOffset: 48 + top }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.xxl,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
          }}
          keyboardShouldPersistTaps='handled'>
          <View style={{ flex: 1 }}>
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
        </ScrollView>

        <View
          style={[
            styles.bottomNavContainer,
            { marginBottom: bottom + theme.spacing.m },
          ]}>
          <Button
            disabled={!isValid}
            style={styles.button}
            onPress={() => onSaveSocialNetworkHandle(inputText)}>
            {originalValue?.url ? 'Save' : 'Add'}
          </Button>
        </View>
      </Container>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bottomNavContainer: {
      width: '100%',
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.m,
    },
    button: {
      height: 48,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
      marginBottom: 0,
    },
    pagerView: {
      flex: 1,
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
