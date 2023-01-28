import Clipboard from '@react-native-clipboard/clipboard'
import { Icon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import _ from 'underscore'

import AccountManager from 'api/AccountManager'
import AlertNotification from 'components/AlertNotification'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import WordCard from '../../components/Words/WordCard'
import { BLACK_COLOR_OPACITY } from '../../constants/color'

const SeedPhraseGenerated = (props) => {
  const [words, setWords] = useState('Generating seed phrase ...')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false)

  useEffect(() => {
    const init = async () => {
      setWords(AccountManager.getInstance().selectedAccount.mnemonic)
    }

    init()
  }, [])

  const onSaved = async () => {
    const mnemonic = words.split(' ')
    const shuffled = _.shuffle(mnemonic)
    props.navigation.navigate('VerifyPhrase', { shuffled })
  }

  const onRemindLater = () => {
    props.navigation.navigate('Home')
  }

  const onClosePress = () => {
    setIsSeedPhraseCopied(false)
  }

  const copyToClipBoard = () => {
    Clipboard.setString(words)
    setIsSeedPhraseCopied(true)
  }

  return (
    <View>
      <NavigationHeader title='Record Your Seed Phrase' />
      <Layout title='Seed Phrase'>
        <Text style={style.title}>Carefully write down each word in order</Text>
        <WordCard words={words} />
        <Button
          color='transparent-grey'
          onPress={copyToClipBoard}
          style={{ marginTop: 10 }}>
          {'Copy to clipboard\u00A0'}
          <Icon name='copy' />
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

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return { publicProfileData: state.publicProfileData }
}

export default connect(mapStateToProps, null)(SeedPhraseGenerated)

const style = StyleSheet.create({
  title: {
    marginTop: 32,
    marginBottom: 16,
    textAlign: 'center',
    color: BLACK_COLOR_OPACITY(0.8),
  },
})
