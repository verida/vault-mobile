import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'
import Words from '../../components/Words'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import { resetPhrase as resetPhraseAction } from 'store/words/actions'
import ErrorPhrase from '../../components/ErrorPhrase'
import { MNEMONIC_LENGTH, walletByMnemonic } from '../../api'

const VerifyPhrase = (props) => {
  const { words, resetPhrase, navigation, route } = props
  const [error, showError] = useState(null)
  const [verified, setVerified] = useState(null)

  useEffect(() => {
    showError(false)
    setVerified(words.length === MNEMONIC_LENGTH)
  }, [words])

  useEffect(() => {
    return () => {
      resetPhrase()
    }
  }, [resetPhrase])

  const onConfirm = async () => {
    try {
      const phrase = words.join(' ')
      await walletByMnemonic(phrase)
      resetPhrase()
      navigation.navigate('CreatePin')
    } catch (e) {
      showError(true)
    }
  }

  return (
    <View>
      <NavigationHeader title='Create An Account' />
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
              onPress={() => navigation.navigate('CreatePin')}>
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
    words: state.template,
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
