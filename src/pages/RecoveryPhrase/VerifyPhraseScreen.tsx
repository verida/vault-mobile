import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import { BottomActionBar, ScreenWrapper } from '~/components'
import ErrorPhrase from '~/components/ErrorPhrase'
import Layout from '~/components/Layouts/Layout'
import Words from '~/components/Words'
import {
  resetPhrase as resetPhraseAction,
  selectSeedPhraseTemplate,
} from '~/features/seedphrases'
import { setShowSeedPhraseReminder } from '~/features/settings'
import { MainStackScreenProps, useScreenCaptureProtection } from '~/navigation'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'

export type VerifyPhraseScreenParams = {
  shuffled: string[]
}

type VerifyPhraseScreenProps = MainStackScreenProps<'VerifyPhrase'>

export const VerifyPhraseScreen: React.FC<VerifyPhraseScreenProps> = (
  props
) => {
  const {
    navigation,
    route: { params },
  } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Record your Seed Phrase',
    })
  }, [navigation])

  useScreenCaptureProtection()

  const dispatch = useAppDispatch()
  const selected = useAppSelector(selectSeedPhraseTemplate)

  const resetPhrase = useCallback(
    () => dispatch(resetPhraseAction()),
    [dispatch]
  )

  const [error, showError] = useState<boolean>(false)
  const [verified, setVerified] = useState<boolean>(false)

  useEffect(() => {
    showError(false)

    const selectedWords = selected.map((item) => params.shuffled[item])

    setVerified(
      selectedWords.join(' ') ===
        AccountManager.getInstance().getSelectedAccount()!.mnemonic
    )

    // TODO: We are not sensitive to route.params.shuffled here, but we should be.
    //       This is for backwards-compatible linter satisfaction only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    return () => {
      resetPhrase()
    }
  }, [resetPhrase])

  const handleConfirmButtonPress = useCallback(async () => {
    try {
      resetPhrase()
      dispatch(setShowSeedPhraseReminder(false))
      await AccountManager.getInstance().updateLastTimeSeedPhraseReminder(true)
      navigation.goBack()
    } catch (cause) {
      showError(true)
    }
  }, [dispatch, navigation, resetPhrase])

  const handleResetButtonPress = useCallback(() => {
    resetPhrase()
  }, [resetPhrase])

  const handleSkipButtonPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <ScreenWrapper>
      <Layout title='Verify Your Phrase'>
        <View>
          <Words words={params.shuffled} />
          <ErrorPhrase shown={error} style={style.error} />
        </View>
      </Layout>
      <BottomActionBar
        actionsOrientation='column'
        actions={
          verified
            ? [
                {
                  label: 'Confirm',
                  onPress: handleConfirmButtonPress,
                },
                {
                  label: 'Clear',
                  onPress: handleResetButtonPress,
                  variant: 'secondary',
                },
              ]
            : [
                {
                  label: 'Skip',
                  onPress: handleSkipButtonPress,
                  variant: 'secondary',
                },
              ]
        }
      />
    </ScreenWrapper>
  )
}

const style = StyleSheet.create({
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
})
