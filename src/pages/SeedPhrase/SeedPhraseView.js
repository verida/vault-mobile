import Clipboard from '@react-native-community/clipboard'
import { Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

import AccountManager from 'api/AccountManager'
import AlertNotification from 'components/AlertNotification'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import WordCard from '../../components/Words/WordCard'

export default () => {
  const [words, setWords] = useState('')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { mnemonic } = AccountManager.getInstance().selectedAccount
      setWords(mnemonic)
    }
    init()
  }, [])

  const onClosePress = () => {
    setIsSeedPhraseCopied(false)
  }

  const copyToClipBoard = () => {
    Clipboard.setString(words)
    setIsSeedPhraseCopied(true)
  }

  return (
    <View>
      <NavigationHeader title='Seed Phrase' />
      <Layout style={{ marginTop: 20 }}>
        <WordCard words={words} />
        <Button
          color='transparent-grey'
          onPress={copyToClipBoard}
          style={{ marginTop: 10 }}>
          {'Copy seed phrase\u00A0'}
          <Icon name='copy' />
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
