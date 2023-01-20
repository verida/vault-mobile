import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Text from 'components/Text'
import { WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import Button from '../../components/Button'

function OutOfService() {
  const title = 'Oh uh!'

  const shutDownTitle =
    'Our networks are temporarily out of service\nPlease check back later.'

  return (
    <LinearGradient
      colors={['#0E1572', '#1467CB', '#1995CB']}
      style={style.landing}>
      <Texture width={425} height={428} />
      <View style={style.positionAbsolute}>
        <View>
          <Logo width={139} height={51} />
          <Text style={style.title}>{title}</Text>
          <Text style={style.subTitle}>{shutDownTitle}</Text>
        </View>
        <View>
          <Button color='secondary' disabled>
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
  subTitle: {
    color: WHITE_COLOR,
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 18,
    marginTop: '15%',
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

export default OutOfService
