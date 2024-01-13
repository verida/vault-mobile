import Clipboard from '@react-native-community/clipboard'
import { useTheme } from 'contexts/ThemeContext'
import _ from 'lodash'
import { Icon } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import AlertNotification from 'components/AlertNotification'
import Button from 'components/Button'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Text } from 'components/Typography/Text'
import WordCard from 'components/Words/WordCard'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type SeedPhraseGeneratedScreenParams = undefined

type SeedPhraseGeneratedScreenProps =
  MainStackScreenProps<'SeedPhraseGenerated'>

export const SeedPhraseGeneratedScreen: React.FC<SeedPhraseGeneratedScreenProps> =
  (props) => {
    const { navigation } = props

    const { theme } = useTheme()
    const [words, setWords] = useState('Generating seed phrase ...')
    const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false)

    useEffect(() => {
      const init = async () => {
        setWords(AccountManager.getInstance().getSelectedAccount()!.mnemonic)
      }

      init()
    }, [])

    const onSaved = useCallback(async () => {
      const mnemonic = words.split(' ')
      const shuffled = _.shuffle(mnemonic)
      navigation.replace('VerifyPhrase', { shuffled })
    }, [navigation, words])

    const onRemindLater = () => {
      navigation.goBack()
    }

    const onClosePress = () => {
      setIsSeedPhraseCopied(false)
    }

    const copyToClipBoard = () => {
      Clipboard.setString(words)
      setIsSeedPhraseCopied(true)
    }

    const styles = useThemeAwareStyle(createStyles)

    return (
      <View>
        <NavigationHeader title='Record Your Seed Phrase' />
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
          <Button color='primary' onPress={onSaved}>
            I have saved my seed words
          </Button>
          <Button color='transparent-grey' onPress={onRemindLater}>
            Remind me later
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
      </View>
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
