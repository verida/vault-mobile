import Clipboard from '@react-native-community/clipboard'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import store from 'reduxStore'
import AccountManager from 'api/AccountManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import WordCard from '../../components/Words/WordCard'

export default () => {
  const [words, setWords] = useState('')

  useEffect(() => {
    const init = async () => {
      const { mnemonic } = store.getState().selectedAccount
      setWords(mnemonic)
    }

    init()
  }, [])

  return (
    <View>
      <NavigationHeader title='Seed Phrase' />
      <Layout style={{ marginTop: 20 }}>
        <WordCard words={words} />
        <Button
          color='transparent-grey'
          onPress={() => Clipboard.setString(words)}
          style={{ marginTop: 10 }}>
          {'Copy seed phrase\u00A0'}
        </Button>
      </Layout>
    </View>
  )
}
