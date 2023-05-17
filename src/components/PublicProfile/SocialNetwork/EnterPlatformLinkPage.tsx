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

import UsernameManager from 'api/UsernameManager'
import ClipboardIcon from 'assets/clipboard_icon.svg'
import TrashBinIcon from 'assets/trash_bin_icon.svg'
import Button from 'components/Button'
import Container from 'components/Container'
import { FormInput } from 'components/Input/FormInput'
import Text from 'components/Text'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const MIN_INPUT_LENGTH = 2
const MAX_INPUT_LENGTH = 32

const VERIDA_NAME_SUFFIX = 'username'
const VERIDA_NAME_PATTERN = /(?!.*\/)username/
const VERIDA_NAME_SUFFIX_LENGTH = VERIDA_NAME_SUFFIX.length

interface PageProps {
  onAddSocialNetworkHandle: (url: string) => void
  socialNetwork: any
}

export interface EnterPlatformLinkPageRefProps {
  focusInput: () => void
}

export const EnterPlatformLinkPage = React.forwardRef(
  (
    { socialNetwork, onAddSocialNetworkHandle }: PageProps,
    receivedRef: React.ForwardedRef<EnterPlatformLinkPageRefProps>
  ) => {
    const { bottom, top } = useSafeAreaInsets()
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
    const [baseURL, setBaseURL] = useState(socialNetwork.baseURL ?? '')

    useEffect(() => {
      setBaseURL(socialNetwork.baseURL ?? '')
      setInputText(socialNetwork.baseURL + VERIDA_NAME_SUFFIX)
    }, [socialNetwork])

    const [inputText, setInputText] = useState(
      socialNetwork.baseURL + 'username'
    )

    const usernameInputRef = useRef<TextInput>(null)

    const [checkingUsername, setCheckingUsername] = useState(false)
    const [availableUsername, setAvailableUsername] = useState(false)
    const [usernameError, setUsernameError] = useState<string | undefined>(
      undefined
    )
    const [checkboxEmpty, setCheckboxEmpty] = useState(true)

    useImperativeHandle(receivedRef, () => ({
      focusInput: () => {
        usernameInputRef.current?.focus()
      },
    }))

    const ensureSelectionPosition = (selection?: {
      start: number
      end: number
    }) => {
      let start, end
      if (!selection) {
        start = baseURL.length
        end = start
      } else {
        if (selection.start < baseURL.length) {
          start = baseURL.length
          console.log('Case 1', baseURL.length, selection.start)
        } else {
          start = selection.start
          console.log('Case 2', selection.start)
        }

        // end = selection.end
      }
      console.log('selection', start, end)

      usernameInputRef.current?.setNativeProps({
        selection: {
          start,
          end: end || start,
        },
      })
    }

    const debounceCheckURL = useCallback(
      debounce(async (text) => {
        try {
          const plainName = text.replace(VERIDA_NAME_PATTERN, '')
          let errorMessage = ''
          if (plainName.length > 0 && plainName.length < MIN_INPUT_LENGTH) {
            errorMessage = `Username length must be >= ${MIN_INPUT_LENGTH}`
          } else if (plainName.length > MAX_INPUT_LENGTH) {
            errorMessage = `Username length must be <= ${MAX_INPUT_LENGTH}`
          } else if (plainName.length > 0 && !plainName.match(/^[a-z0-9_]+$/)) {
            errorMessage = `Only lowercase alphanumeric characters and underscore allowed`
          }
          setUsernameError(errorMessage)
          if (errorMessage || plainName.length === 0) return

          setCheckboxEmpty(false)
          setCheckingUsername(true)
          const claimed = await UsernameManager.usernameExists(text)
          setAvailableUsername(!claimed)
          if (claimed) {
            setUsernameError('This username is already taken')
          }
        } catch (error) {
          setUsernameError('Unable to check the username')
        } finally {
          setCheckingUsername(false)
        }
      }, 1500),
      []
    )

    if (!socialNetwork) return null

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
              ref={usernameInputRef}
              placeholder={`${socialNetwork.label} Account URL`}
              label={`${socialNetwork.label} Account URL`}
              autoFocus={false}
              autoCorrect={false}
              keyboardType='url'
              autoComplete='off'
              autoCapitalize='none'
              returnKeyType='done'
              withAnimatedChecbox
              checkboxEmptyState={checkboxEmpty}
              loading={checkingUsername}
              checked={availableUsername}
              errorMessage={usernameError}
              maxLength={baseURL.length + 120}
              onFocus={() => {
                ensureSelectionPosition(undefined)
              }}
              onSelectionChange={(e) => {
                ensureSelectionPosition(e.nativeEvent.selection)
              }}
              onChangeText={(text) => {
                setUsernameError('')
                setCheckboxEmpty(true)
                setAvailableUsername(false)
                console.log(
                  'inputText',
                  inputText,
                  !text.startsWith(baseURL),
                  text
                )
                if (text === '' || !text.startsWith(baseURL)) {
                  console.log('Here', text)
                  setInputText(undefined)
                  setTimeout(() => {
                    setInputText(baseURL + VERIDA_NAME_SUFFIX)
                    setTimeout(() => {
                      ensureSelectionPosition()
                    }, 1)
                  }, 0)
                } else if (
                  inputText === baseURL + VERIDA_NAME_SUFFIX &&
                  text !== inputText
                ) {
                  const updateText = text.replace(VERIDA_NAME_SUFFIX, '')
                  setInputText(updateText)
                  setTimeout(() => {
                    usernameInputRef.current?.setNativeProps({
                      selection: {
                        start: updateText.length,
                        end: updateText.length,
                      },
                    })
                  }, 10)
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
                setInputText(text)
              }}>
              <View style={styles.clipboardPasteButton}>
                <ClipboardIcon />
                <Text style={styles.clipboardPasteButtonText}>
                  Paste from clipboard
                </Text>
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
            disabled={inputText.length < 2}
            style={styles.button}
            onPress={() => onAddSocialNetworkHandle(inputText)}>
            Add
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
      marginLeft: theme.spacing.sm,
      fontFamily: NUNITO_SANS_BOLD,
    },
  })
