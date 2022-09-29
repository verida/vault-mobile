import React, { useEffect, useState } from 'react'
import Clipboard from '@react-native-community/clipboard'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'

import AccountManager from 'api/AccountManager'
import AlertNotification from 'components/AlertNotification'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Layout from '../../components/Layouts/Layout'

import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from 'components/SeedPhraseModal/SeedPhraseWarningModal'

import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'

export default () => {
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false);
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)

  useEffect(() => {
    const init = async () => {
      const { mnemonic } = AccountManager.getInstance().selectedAccount
      setSeedPhraseData(mnemonic)

    }
    init()
  }, [])

  const showSeedPhrase = () => {
    setSeedPhraseModalVisible(false)
    toggleCopySeedPhraseModal(true)

  }

  const onClosePress = () => {
    setIsSeedPhraseCopied(false)
  }

  return (
    <View >
      <NavigationHeader title='Seed Phrase' />
      <Layout title="View Seed Phrase">
        <TouchableOpacity
          onPress={() => setSeedPhraseModalVisible(true)}
          style={styles.actionButton}>
          <ExportSeedphraseSvg />
          <Text style={styles.actionButtonText}>Seed phrase</Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Your seed phrase is a list of words. Please record them carefully
          and store in a safe place.
        </Text>
        <SeedPhraseWarningModal
          hideModal={() => setSeedPhraseModalVisible(false)}
          visible={seedPhraseModalVisible}
          type='seed_phrase'
          onPressButton={showSeedPhrase}
        />
        <CopySeedPhraseModal
          visible={copySeedPhraseModalVisible}
          phrase={seedPhraseData}
          onPress={() => {
            Clipboard.setString(seedPhraseData)
            setIsSeedPhraseCopied(true)
          }}
          toggleConfirmModal={() =>
            toggleCopySeedPhraseModal(!copySeedPhraseModalVisible)
          }
        />
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

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    marginTop: 20
  },
  description: {
    marginTop: 16,
  },
  actionButtonText: { marginTop: 5, fontSize: 14 },
})