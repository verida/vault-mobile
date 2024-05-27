import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import AccountManager from '~/api/AccountManager'
import ExportSeedphraseSvg from '~/assets/export_seedphrase.svg'
import { ScreenWrapper, Typography } from '~/components'
import AlertNotification from '~/components/AlertNotification'
import CopySeedPhraseModal from '~/components/SeedPhraseModal/CopySeedPhraseModal'
import SeedPhraseWarningModal from '~/components/SeedPhraseModal/SeedPhraseWarningModal'
import { BLACK_ORIGIN_COLOR } from '~/constants/color'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type SeedPhraseViewScreenParams = undefined

type SeedPhraseViewScreenProps = MainStackScreenProps<'SeedPhraseView'>

export const SeedPhraseViewScreen: React.FC<SeedPhraseViewScreenProps> = (
  props
) => {
  const { navigation } = props

  const [loading, setLoading] = useState(true)
  const [seedPhraseData, setSeedPhraseData] = useState('')
  const [isSeedPhraseCopied, setIsSeedPhraseCopied] = useState(false)
  const [seedPhraseModalVisible, setSeedPhraseModalVisible] = useState(false)
  const [copySeedPhraseModalVisible, toggleCopySeedPhraseModal] =
    useState(false)
  const [pinCodeStatus, setPinCodeStatus] = useState(true)
  const [isPinCorrect, setPinCorrectStatus] = useState(false)

  useEffect(() => {
    const initUserPin = async () => {
      const status = await hasUserSetPinCode()
      setPinCodeStatus(status)
      setLoading(false)
    }

    initUserPin()

    const init = async () => {
      const account = AccountManager.getInstance().getSelectedAccount()
      setSeedPhraseData(account?.mnemonic || '')
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

  useEffect(() => {
    navigation.setOptions({
      headerShown: !loading && !(pinCodeStatus && !isPinCorrect),
      title: 'Seed Phrase',
    })
  }, [navigation, loading, pinCodeStatus, isPinCorrect])

  const styles = useThemeAwareStyle(createStyles)

  const handleShowButtonPress = useCallback(() => {
    setSeedPhraseModalVisible(true)
  }, [])

  if (loading) {
    return (
      <View>
        <Text>Loading </Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (pinCodeStatus && !isPinCorrect) {
    return (
      <PINCode
        status={'enter'}
        titleEnter={'Enter your PIN'}
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
    <>
      <ScreenWrapper>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={handleShowButtonPress}
            style={styles.actionButton}>
            <ExportSeedphraseSvg />
            <Typography variant='bodySemiBold'>Show</Typography>
          </TouchableOpacity>
          <Typography>
            Your seed phrase is a list of words. Please record them carefully
            and store in a safe place.
          </Typography>
        </View>
      </ScreenWrapper>
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
    </>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
      gap: theme.spacing.m,
    },
    actionButton: {
      alignItems: 'center',
    },
    actionButtonText: {
      // marginTop: 5,
      fontSize: 14,
    },
  })
