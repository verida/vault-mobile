import Color from 'color'
import React, { useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { useDebouncedCallback } from 'use-debounce'

import UsernameManager from '~/api/UsernameManager'
import { FormInput } from '~/components/Input/FormInput'
import { BottomActionBar } from '~/components/ScreenLayouts'
import { Headline } from '~/components/Typography/Headline'
import { Text } from '~/components/Typography/Text'
import { NUNITO_SANS } from '~/constants/text'
import { useTheme } from '~/contexts/ThemeContext'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { Theme } from '~/styles/types'

const MIN_INPUT_LENGTH = 2
const MAX_INPUT_LENGTH = 32

const VERIDA_NAME_SUFFIX = '.vda'
const VERIDA_NAME_PATTERN = /\.vda$/
const VERIDA_NAME_SUFFIX_LENGTH = VERIDA_NAME_SUFFIX.length

interface PageProps {
  onClaimUsername: (username: string) => void
}

export interface InputUsernameViewRefProps {
  focusInput: () => void
}

export const InputUsernameView = React.forwardRef(
  (
    { onClaimUsername }: PageProps,
    receivedRef: React.ForwardedRef<InputUsernameViewRefProps>
  ) => {
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()

    const [inputText, setInputText] = useState<string>('')
    const usernameInputRef = useRef<TextInput | null>(null)

    const [checkingUsername, setCheckingUsername] = useState<boolean>(false)
    const [availableUsername, setAvailableUsername] = useState<boolean>(false)
    const [usernameError, setUsernameError] = useState<string | undefined>(
      undefined
    )
    const [checkboxEmpty, setCheckboxEmpty] = useState<boolean>(true)

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
        start = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
        end = start
      } else {
        if (selection.start > inputText.length - VERIDA_NAME_SUFFIX_LENGTH) {
          start = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
        } else {
          start = selection.start
        }

        if (selection.end > inputText.length - VERIDA_NAME_SUFFIX_LENGTH) {
          end = inputText.length - VERIDA_NAME_SUFFIX_LENGTH
        } else {
          end = selection.end
        }
      }

      usernameInputRef.current?.setNativeProps({
        selection: {
          start,
          end,
        },
      })
    }

    const debounceCheckUsername = useDebouncedCallback(
      React.useCallback(async (text: string) => {
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
      }, []),
      1500
    )

    return (
      <View key={'InputUsername'} style={styles.container}>
        <View style={styles.content}>
          <Headline style={{ marginBottom: 10 }}>Username</Headline>
          <Text style={{ marginBottom: theme.spacing.l }}>
            Your username is unique to your identity.
          </Text>
          <FormInput
            ref={usernameInputRef}
            placeholder={`veridaname${VERIDA_NAME_SUFFIX}`}
            label={'Username'}
            desciption={
              usernameError ? undefined : 'Your username is public and optional'
            }
            autoFocus={false} // TODO Investigate: There's an crash when combining with pagerview, so we will do a delay and manually set focus the input
            autoCorrect={false}
            autoComplete='off'
            autoCapitalize='none'
            returnKeyType='done'
            withAnimatedChecbox
            checkboxEmptyState={checkboxEmpty}
            loading={checkingUsername}
            checked={availableUsername}
            errorMessage={usernameError}
            maxLength={MAX_INPUT_LENGTH + VERIDA_NAME_SUFFIX_LENGTH}
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
              if (text.length > 0 && !text.match(VERIDA_NAME_PATTERN)) {
                setInputText(text + VERIDA_NAME_SUFFIX)
              } else if (text === VERIDA_NAME_SUFFIX) {
                setInputText('')
              } else {
                setInputText(text)
              }
              debounceCheckUsername(text)
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
        </View>
        <BottomActionBar
          // TODO: Investigate as the button briefly disapear when keyboard is shown
          actions={[
            {
              label: 'Claim',
              onPress: () => onClaimUsername(inputText),
              disabled: Boolean(usernameError) || !availableUsername,
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
  })
