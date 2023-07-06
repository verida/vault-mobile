import { useNavigation } from '@react-navigation/native'
import { resetPhrase as resetPhraseAction } from 'features/seedphrases'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect, useDispatch } from 'react-redux'

import AccountManager from 'api/AccountManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { setShowSeedPhraseReminder } from 'reduxStore/general/actions'

import Button from '../../components/Button'
import ErrorPhrase from '../../components/ErrorPhrase'
import Layout from '../../components/Layouts/Layout'
import Words from '../../components/Words'

const VerifyPhrase = (props) => {
  const { selected = [], resetPhrase, route } = props
  const [error, showError] = useState(null)
  const [verified, setVerified] = useState(null)
  const dispatch = useDispatch()
  const navigation = useNavigation()

  useEffect(() => {
    showError(false)

    const selectedWords = selected.map((item) => route.params.shuffled[item])

    setVerified(
      selectedWords.join(' ') ===
        AccountManager.getInstance().getSelectedAccount().mnemonic
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
    } catch (e) {
      showError(true)
    }
  }

  return (
    <View>
      <NavigationHeader title='Record Your Seed Phrase' />
      <Layout title='Verify Your Phrase' style={style.layout}>
        <View>
          <Words words={route.params.shuffled} />
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

const mapStateToProps = (state) => {
  return {
    selected: state.main.template,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetPhrase: () => dispatch(resetPhraseAction()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerifyPhrase)

const style = StyleSheet.create({
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
})
