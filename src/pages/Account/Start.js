import React from 'react'
import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Logo from '../../assets/logo.svg'
import Texture from '../../assets/landing-bg.svg'
import { Icon } from 'native-base'

import Button from '../../components/Button'
import Text from '../../components/Text'

import { WHITE_COLOR } from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

function Start(props) {
  const title = "Welcome!\nIt's time to own your personal data."

  const createAcc = () => props.navigation.navigate('CreateAccount')
  const importAcc = () => props.navigation.navigate('ImportAccount')

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
        <View style={style.modal}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={[style.text, { color: '#EF7936' }]}>
              <Icon
                type='AntDesign'
                name='exclamationcircleo'
                style={[style.text, { color: '#EF7936' }]}
              />
              &nbsp; Warning: Alpha Software
            </Text>
          </View>
          <Text style={[style.text, { textAlign: 'left', fontSize: 12 }]}>
            This is alpha software and is for testing purposes only. All data
            stored will be deleted every month. Use this software at your own
            risk as it is still in active development.
          </Text>
        </View>
        <View>
          <Button color='secondary' onPress={createAcc}>
            Create An Account
          </Button>
          <Button color='outlined' onPress={importAcc}>
            Import An Account
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
