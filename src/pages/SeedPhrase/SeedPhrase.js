import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'

import SafeImg from '../../assets/safe.svg'
import Button from '../../components/Button'
import Layout from '../../components/Layouts/Layout'

const SeedPhrase = (props) => {
  const [disabled, setDisabled] = useState(false)

  const onRemindLatter = () => {
    setDisabled(true)
    props.navigation.goBack()
  }

  function onShow() {
    props.navigation.pop(1)
    props.navigation.navigate('SeedPhraseGenerated')
  }

  return (
    <Container>
      <NavigationHeader title='Record Your Seed Phrase' />
      <Content>
        <Layout title='Seed Phrase'>
          <Text style={style.description}>
            A seed phrase is the only way to recover access to your account if
            your phone is lost, stolen, broken or upgraded.
          </Text>
          <SafeImg style={{ marginVertical: 28, alignSelf: 'center' }} />
          <Text style={style.description}>
            Your seed phrase is a list of words. Please record them carefully
            and store in a safe place.
          </Text>
          <Text style={style.highlight}>
            Warning: There is no password reset!
          </Text>
          <Button
            style={{ marginTop: 56 }}
            disabled={disabled}
            color='primary'
            onPress={onShow}>
            Show Seed Phrase
          </Button>
          <Button
            disabled={disabled}
            color='transparent-grey'
            onPress={onRemindLatter}>
            Remind me later
          </Button>
        </Layout>
      </Content>
    </Container>
  )
}

const mapStateToProps = (state) => {
  return { publicProfileData: state.main.publicProfileData }
}

export default connect(mapStateToProps, null)(SeedPhrase)

const style = StyleSheet.create({
  description: {
    marginTop: 16,
  },
  highlight: {
    textDecorationLine: 'underline',
    marginTop: 16,
  },
})
