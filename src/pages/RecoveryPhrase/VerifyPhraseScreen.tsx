import {
  resetPhrase as resetPhraseAction,
  selectSeedPhraseTemplate,
} from 'features/seedphrases'
import { setShowSeedPhraseReminder } from 'features/settings'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import Button from 'components/Button'
import ErrorPhrase from 'components/ErrorPhrase'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Words from 'components/Words'
import { MainStackScreenProps } from 'navigation/types'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

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

  const dispatch = useAppDispatch()
  const selected = useAppSelector(selectSeedPhraseTemplate)

  const resetPhrase = useCallback(
    () => dispatch(resetPhraseAction()),
    [dispatch]
  )

  const [error, showError] = useState(false)
  const [verified, setVerified] = useState(false)

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

  const onConfirm = async () => {
    try {
      resetPhrase()
      dispatch(setShowSeedPhraseReminder(false))
      await AccountManager.getInstance().updateLastTimeSeedPhraseReminder(true)
      navigation.goBack()
    } catch (cause) {
      showError(true)
    }
  }

  return (
    <View>
      <NavigationHeader title='Record Your Seed Phrase' />
      <Layout title='Verify Your Phrase'>
        <View>
          <Words words={params.shuffled} />
          <ErrorPhrase shown={error} style={style.error} />
        </View>
        <View>
          {!verified && (
            <Button
              style={{ marginTop: 20 }}
              color='transparent-grey'
              onPress={() => {
                navigation.goBack()
              }}>
              Skip
            </Button>
          )}
          {verified && (
            <>
              <Button
                style={{ marginTop: 20 }}
                color='primary'
                onPress={onConfirm}>
                Confirm
              </Button>
              <Button
                style={{ marginTop: 10 }}
                color='transparent-grey'
                onPress={resetPhrase}>
                Clear
              </Button>
            </>
          )}
        </View>
      </Layout>
    </View>
  )
}

const style = StyleSheet.create({
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
})
