import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect } from 'react'
import { Alert, StyleSheet, View } from 'react-native'

import Texture from 'assets/landing-bg.svg'
import Logo from 'assets/logo.svg'
import Text from 'components/Text'
import { WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { AuthStackParams } from 'navigation/types'

import Button from '../../components/Button'

const SHOW_BANNER_KEY = 'show_banner'

function Start(props: NativeStackScreenProps<AuthStackParams, 'Start'>) {
  useEffect(() => {
    const init = async () => {
      await SecureStore.setItemAsync(SHOW_BANNER_KEY, 'set')
      const showBanner = await SecureStore.getItemAsync(SHOW_BANNER_KEY)
      if (!showBanner || showBanner !== 'set') {
        Alert.alert(
          'Important Notice',
          'Testnet 1 data has been reset, if you are unable to access your accounts, this is normal. You can now create new accounts in such cases.'
        )
        await SecureStore.setItemAsync(SHOW_BANNER_KEY, 'set')
      }
    }
    init()
  })
  const title = "Welcome!\nIt's time to own your personal data."

  const createAcc = () => props.navigation.navigate('CreateIdentity')
  // props.navigation.navigate('CreateAccount', {
  //   mode: CreateAccountMode.CREATE,
  // })

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
