import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Button from 'components/Button'
import Layout from 'components/Layouts/Layout'
import Text from 'components/Text'
import { MainStackParams } from 'navigation/types'

import FailureCross from '../../assets/failure_cross.svg'
import SuccessTick from '../../assets/success_tick.svg'
import { BLACK_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD } from '../../constants/text'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParams>
  route: any
}

export default (props: Props) => {
  const { navigation, route } = props
  const { failure } = route.params
  const icon = failure ? <FailureCross /> : <SuccessTick />
  const titleText = failure ? 'Ooops..' : 'Success!'
  const descriptionText = failure
    ? 'Something went wrong. Please try to add / import your wallet again'
    : 'You have successfully added / imported your wallet'
  const buttonLabel = failure ? 'Try Again' : 'Done'

  return (
    <Layout style={styles.container}>
      <View style={styles.content}>
        {icon}
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.description}>{descriptionText}</Text>
      </View>
      <View style={styles.footer}>
        <Button
          style={styles.successButton}
          color='primary'
          disabled={false}
          loading={false}
          onPress={() => {
            navigation.goBack()
          }}>
          {buttonLabel}
        </Button>
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  title: {
    marginVertical: 20,
    fontSize: 28,
    color: BLACK_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
  },
  footer: {
    alignItems: 'center',
  },
  successButton: {
    alignSelf: 'stretch',
  },
  description: {
    fontFamily: 'NunitoSans',
    fontWeight: '400',
    fontSize: 16,
    color: BLACK_COLOR,
    opacity: 0.6,
    lineHeight: 24,
    textAlign: 'center',
  },
})
