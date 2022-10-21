import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import AccountManager from 'api/AccountManager'
import ExportSeedphraseSvg from 'assets/export_seedphrase.svg'
import AlertNotification from 'components/AlertNotification'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CopySeedPhraseModal from 'components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from 'components/SeedPhraseModal/SeedPhraseWarningModal'
import { BLACK_ORIGIN_COLOR } from 'constants/color'

import Layout from '../../components/Layouts/Layout'

export default () => {
  const [loading, setLoading] = useState(true)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  useEffect(() => {
    const initUSerPin = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    initUSerPin()

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading </Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (pinCodeStatus && !isPinCorrect) {
    return (
      <PINCode
        status={'enter'}
        titleEnter={'Enter your  PIN'}
        onClickButtonLockedPage={() => BackHandler.exitApp()}
        finishProcess={() => setPinCorrectStatus(true)}
        colorCircleButtons='#dfe1e8'
        stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
        stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
        stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
        stylePinCodeDeleteButtonSize={45}
        stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
      />
    )
  }

  return (
    <View>
      <NavigationHeader title='Seed Phrase' />
      <Layout title='View Seed Phrase'>
        <TouchableOpacity
          onPress={() => setSeedPhraseModalVisible(true)}
          style={styles.actionButton}>
          <ExportSeedphraseSvg />
          <Text style={styles.actionButtonText}>Seed phrase</Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Your seed phrase is a list of words. Please record them carefully and
          store in a safe place.
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
    marginTop: 20,
  },
  description: {
    marginTop: 16,
  },
  actionButtonText: { marginTop: 5, fontSize: 14 },
})
