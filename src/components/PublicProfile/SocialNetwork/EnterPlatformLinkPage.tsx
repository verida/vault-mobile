import Clipboard from '@react-native-community/clipboard'
import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import { debounce } from 'lodash'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { VeridaOnePlatformLink } from 'api/types'
import ClipboardIcon from 'assets/clipboard_icon.svg'
import Button from 'components/Button'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import { Caption } from 'components/Typography/Caption'
import { PlatformLinkData } from 'constants/profile'
import { NUNITO_SANS } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const MAX_INPUT_LENGTH = 120

const USERNAME_PLACEHOLDER = 'username'
const VERIDA_NAME_PATTERN = /(?!.*\/)username/

interface PageProps {
  onSaveSocialNetworkHandle: (url: string) => void
  platformLink: PlatformLinkData
  originalValue?: VeridaOnePlatformLink
}

export interface EnterPlatformLinkPageRefProps {
  focusInput: () => void
}

export const EnterPlatformLinkPage = React.forwardRef(
  (
    { platformLink, originalValue, onSaveSocialNetworkHandle }: PageProps,
    receivedRef: React.ForwardedRef<EnterPlatformLinkPageRefProps>
  ) => {
    const { bottom, top } = useSafeAreaInsets()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
    const [baseURL, setBaseURL] = useState(platformLink.baseURL ?? '')
    const [isValid, setIsValid] = useState(false)
    const [inputText, setInputText] = useState(
      platformLink.baseURL + USERNAME_PLACEHOLDER
    )

    const urlInputRef = useRef<TextInput>(null)
    useImperativeHandle(receivedRef, () => ({
      focusInput: () => {
        urlInputRef.current?.focus()
      },
    }))

    useEffect(() => {
      setBaseURL(platformLink.baseURL ?? '')
      originalValue
        ? setInputText(originalValue.url)
        : setInputText(platformLink.baseURL + USERNAME_PLACEHOLDER)
    }, [platformLink, originalValue])

    useEffect(() => {
      const cleanUrl = inputText
        .replace(platformLink.baseURL, '')
        .replace(/(\s)|(\/+$)/, '')
      const cleanUsername = cleanUrl.split('/').pop()
      if (
        (cleanUsername !== USERNAME_PLACEHOLDER && cleanUsername?.length) ??
        0 > 2
      ) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    }, [inputText, platformLink])

    const getInitialUrl = () => platformLink.baseURL + USERNAME_PLACEHOLDER

    const ensureSelectionPosition = useCallback(
      debounce((text: string, selection?: { start: number; end: number }) => {
        let start, end
        if (!selection) {
          if (text === getInitialUrl()) {
            start = baseURL.length
          } else {
            start = text.length
          }
        } else {
          start = selection.start
          end = selection.end
          if (start < baseURL.length) {
            start = baseURL.length
          } else {
            start = selection.start
          }
        }

        if (!end || end < start) {
          end = start
        }

        urlInputRef.current?.setNativeProps({
          selection: {
            start,
            end,
          },
        })
      }, 10),
      [platformLink, baseURL]
    )

    const setSelectionEnd = (text: string) => {
      setTimeout(() => {
        urlInputRef.current?.setNativeProps({
          selection: {
            start: text.length,
            end: text.length,
          },
        })
      }, 10)
    }

    if (!platformLink) return null

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
              placeholder={`${platformLink.label} Account URL`}
              label={`${platformLink.label} Account URL`}
              autoFocus={false}
              autoCorrect={false}
              keyboardType='url'
              autoComplete='off'
              autoCapitalize='none'
              returnKeyType='done'
              maxLength={baseURL.length + MAX_INPUT_LENGTH}
              onFocus={() => {
                ensureSelectionPosition(inputText)
              }}
              onSelectionChange={(e) => {
                ensureSelectionPosition(inputText, e.nativeEvent.selection)
              }}
              onChangeText={(text) => {
                if (text === '' || !text.startsWith(baseURL)) {
                  setInputText('')
                  setTimeout(() => {
                    setInputText(getInitialUrl())
                    setTimeout(() => {
                      ensureSelectionPosition(inputText)
                    }, 0)
                  }, 0)
                } else if (
                  inputText === getInitialUrl() &&
                  text !== inputText
                ) {
                  const updateText = text.replace(USERNAME_PLACEHOLDER, '')
                  setInputText(updateText)
                } else {
                  setInputText(text)
                }
              }}>
              <ParsedText
                style={{
                  fontFamily: NUNITO_SANS,
                  fontSize: theme.fontSize.m,
                  color: theme.color.onBackground,
                }}
                parse={[
                  {
                    pattern: VERIDA_NAME_PATTERN,
                    style: {
                      fontFamily: NUNITO_SANS,
                      fontSize: theme.fontSize.m,
                      color: Color(theme.color.onBackground)
                        .alpha(0.4)
                        .toString(),
                    },
                  },
                ]}>
                {inputText}
              </ParsedText>
            </FormInput>
            <Button
              color='transparent-link'
              onPress={async () => {
                const text = await Clipboard.getString()
                setInputText(platformLink.baseURL + text)
                setSelectionEnd(platformLink.baseURL + text)
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
