import { Container, Content } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import CustomFooter from 'components/Layouts/CustomFooter'
import Text from 'components/Text'
import { useAuth } from 'hooks/useAuth'
import { setAuthStatus as setAuthStatusAction } from 'reduxStore/general/actions'

import Success from '../assets/success.svg'
import Button from '../components/Button'
import Details from '../components/Details'
import Layout from '../components/Layouts/Layout'
import { BLACK_COLOR } from '../constants/color'
import { NUNITO_SANS_BOLD } from '../constants/text'

const SuccessPage = (props) => {
  const { setAuthStatus } = props
  const { refresh } = useAuth()

  const onDone = async () => {
    setAuthStatus(true)
    await refresh()
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

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => {
  return {
    setAuthStatus: (status) => dispatch(setAuthStatusAction(status)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SuccessPage)
