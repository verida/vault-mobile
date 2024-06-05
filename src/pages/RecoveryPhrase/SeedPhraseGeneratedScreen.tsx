import Clipboard from '@react-native-clipboard/clipboard'
import { shuffle } from 'lodash'
import { Icon } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { BottomActionBar, ScreenWrapper } from '~/components'
import AlertNotification from '~/components/AlertNotification'
import Button from '~/components/Button'
import Layout from '~/components/Layouts/Layout'
import { Text } from '~/components/Typography/Text'
import WordCard from '~/components/Words/WordCard'
import { useTheme } from '~/contexts/ThemeContext'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps, useScreenCaptureProtection } from '~/navigation'
import { Theme } from '~/styles/types'

export type SeedPhraseGeneratedScreenParams = undefined

type SeedPhraseGeneratedScreenProps =
  MainStackScreenProps<'SeedPhraseGenerated'>

export const SeedPhraseGeneratedScreen: React.FC<
  SeedPhraseGeneratedScreenProps
> = (props) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Record your Seed Phrase',
    })
  }, [navigation])

  useScreenCaptureProtection()

  const { theme } = useTheme()
  const [words, setWords] = useState<string>('Generating seed phrase ...')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState<boolean>(false)

  useEffect(() => {
    const init = async () => {
      setWords(AccountManager.getInstance().getSelectedAccount()!.mnemonic)
    }

    init()
  }, [])

  const handleSavedButtonPress = useCallback(() => {
    const mnemonic = words.split(' ')
    const shuffled = shuffle(mnemonic)
    navigation.replace('VerifyPhrase', { shuffled })
  }, [navigation, words])

  const handleRemindLaterButtonPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onClosePress = useCallback(() => {
    setIsSeedPhraseCopied(false)
  }, [])

  const copyToClipBoard = useCallback(() => {
    Clipboard.setString(words)
    setIsSeedPhraseCopied(true)
  }, [words])

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper>
      <Layout title='Seed Phrase'>
        <Text style={styles.title}>
          Carefully write down each word in order
        </Text>
        {words ? <WordCard words={words} /> : null}
        <Button
          color='transparent-grey'
          onPress={copyToClipBoard}
          style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.copyButtonText}>
              {'Copy to clipboard\u00A0'}
            </Text>
            <Icon name='copy' style={{ color: theme.color.black600 }} />
          </View>
        </Button>
        <AlertNotification
          onClosePress={onClosePress}
          isOpened={isSeedPhraseCopied}
          type='success'
          bodyText='Seed Phrase copied to clipboard'
          title='Seed Phrase Copied'
          timeOutInSeconds={5}
        />
      </Layout>
      <BottomActionBar
        actionsOrientation='column'
        actions={[
          {
            label: 'I have saved my seed phrase',
            onPress: handleSavedButtonPress,
          },
          {
            label: 'Remind me later',
            onPress: handleRemindLaterButtonPress,
            variant: 'secondary',
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      marginTop: 32,
      marginBottom: 16,
      textAlign: 'center',
      color: theme.color.black800,
    },
    copyButtonText: {
      color: theme.color.black600,
    },
  })
