import React from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Logo from 'assets/logo.svg'
import Texture from 'assets/landing-bg.svg'

import Button from '../../components/Button'
import Text from 'components/Text'

import { WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from 'navigation/types'

function Start(props: NativeStackScreenProps<AuthStackParams, 'Start'>) {
  const title = "Welcome!\nIt's time to own your personal data."

  const createAcc = () => props.navigation.navigate('CreateAccount')

  return (
    <LinearGradient
      colors={['#0E1572', '#1467CB', '#1995CB']}
      style={style.landing}>
      <Texture width={425} height={428} />
      <View style={style.positionAbsolute}>
        <View>
          <Logo width={139} height={51} />
          <Text style={style.title}>{title}</Text>
        </View>
        <View>
          <Button color='secondary' onPress={createAcc}>
            Get Started
          </Button>
        </View>
      </View>
    </LinearGradient>
  )
}

const style = StyleSheet.create({
  positionAbsolute: {
    position: 'absolute',
    paddingHorizontal: 24,
    paddingVertical: 77,
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  landing: {
    flex: 1,
  },
  title: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 36,
    marginTop: '35%',
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  modal: {
    backgroundColor: '#FDF4EA',
    paddingLeft: 15,
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
  },
})

export default Start
