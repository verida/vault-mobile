import React from 'react'
import { StyleSheet, View } from 'react-native'

import Success from '../assets/success.svg'

import Text from 'components/Text'
import Button from '../components/Button'
import Layout from '../components/Layouts/Layout'
import { BLACK_COLOR } from '../constants/color'
import { NUNITO_SANS_BOLD } from '../constants/text'
import { useAuth } from 'hooks/useAuth'
import { Container, Content } from 'native-base'
import CustomFooter from 'components/Layouts/CustomFooter'
import Details from 'components/Details/Details'

const SuccessPage = () => {
  const { initialize } = useAuth()

  const onDone = () => {
    initialize()
  }

  return (
    <Container>
      <Content style={style.content}>
        <Layout>
          <View style={style.header}>
            <Success />
            <Text style={style.title}>Success!</Text>
          </View>
          <Text style={style.description}>
            A new wallet has been created and installed on your device.
          </Text>
          <Details />
        </Layout>
      </Content>
      <CustomFooter>
        <Button color='primary' onPress={onDone}>
          Done
        </Button>
      </CustomFooter>
    </Container>
  )
}

export default SuccessPage

const style = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    margin: 32,
    fontSize: 28,
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
  },
  description: {
    fontFamily: 'NunitoSans',
    fontWeight: '500',
    fontSize: 14,
    color: BLACK_COLOR,
    opacity: 0.6,
  },
})
