import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { QRCode } from 'react-native-custom-qr-codes-expo'
import { connect } from 'react-redux'

import Text from 'components/Text'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Container, Content } from 'native-base'

import EnvelopeSvg from '../../assets/icons/envelope.svg'
import SettingsSvg from '../../assets/icons/settings.svg'
import Clipboard from '@react-native-community/clipboard'
import QRCodeIcon from 'assets/icons/qr-code.svg'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import {
  BLACK_COLOR_OPACITY,
  BLACK_ORIGIN_COLOR,
  ORANGE_COLOR,
  WHITE_COLOR,
} from '../../constants/color'
import { setNewMessagesCount as setNewMessagesCountAction } from '../../reduxStore/general/actions'

import { getVault, getWallet, loadAvatarSource } from '../../api'
import { useIsFocused } from '@react-navigation/native'
import LoadingView from 'components/LoadingView'
import { FIRST_TIME_LOGIN_KEY } from 'api'
import * as SecureStore from 'expo-secure-store'

const DefaultAvatar = require('../../assets/stubs/avatar.png')
const LogoImg = require('../../assets/vault-logo.png')

const Home = (props) => {
  const { setNewMessagesCount, navigation } = props
  const [info, setInfo] = useState({})
  const [avatarSource, setAvatarSource] = useState(DefaultAvatar)
  const [loading, setLoading] = useState(true)
  const isFocused = useIsFocused()

  useEffect(() => {
    const fetchInboxCount = async () => {
      const vault = await getVault()
      const messages = await vault.inbox.fetchLatest({ read: false })
      setNewMessagesCount(messages.length)
    }

    const init = async () => {
      try {
        const wallet = await getWallet()
        const vault = await getVault()
        const name = await vault.profiles.public.get('name')
        // const source = await loadAvatarSource()
        // setAvatarSource(source)
        //
        // setInfo({
        //   address: wallet.did,
        //   name,
        // })
        //
        // const messaging = await vault.inbox.getMessaging()
        // messaging.onMessage(function () {
        //   fetchInboxCount()
        // })
        setLoading(false)
      } catch (e) {
        console.log('home error:', e)
      }
    }

    async function checkFirstTimeLogin() {
      const isFirstTimeLogin = await SecureStore.getItemAsync(
        FIRST_TIME_LOGIN_KEY
      )
      if (isFirstTimeLogin) {
        await SecureStore.deleteItemAsync(FIRST_TIME_LOGIN_KEY)
        navigation.navigate('ScanQrCode', {
          firstTime: true,
        })
      }
    }

    checkFirstTimeLogin()
    init()
    fetchInboxCount()
  }, [setNewMessagesCount, isFocused, navigation])

  function onScanQRPress() {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
    })
  }

  return (
    <Container>
      <NavigationHeader
        left={{
          action: () => props.navigation.navigate('Inbox'),
          icon: (
            <View>
              <EnvelopeSvg />
              {props.newMessagesCount ? (
                <View style={style.badge}>
                  <Text style={{ fontSize: 9 }}>{props.newMessagesCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }}
        right={{
          action: () => props.navigation.navigate('Settings'),
          icon: <SettingsSvg />,
        }}
      />
      <Content contentContainerStyle={style.content}>
        {loading ? (
          <LoadingView />
        ) : (
          <>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('PublicProfile')}>
              <Image source={avatarSource} style={style.userImg} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Clipboard.setString(info.address)}
              style={style.didTouchable}>
              <Text style={style.text}>{info.address}</Text>
            </TouchableOpacity>
            <View style={style.qr}>
              <QRCode
                logo={LogoImg}
                logoSize={60}
                size={207}
                codeStyle='dot'
                innerEyeStyle='circle'
                padding={0.5}
                content={info.address}
              />
            </View>
            <Text style={style.notes}>
              This is your QR-Code. Present it to others so they can scan it and
              connect to you
            </Text>
            <TouchableOpacity
              style={style.scanQRButton}
              onPress={onScanQRPress}>
              <QRCodeIcon />
              <Text style={style.scanQRButtonText}>Scan QR</Text>
            </TouchableOpacity>
          </>
        )}
      </Content>
    </Container>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setNewMessagesCount: (data) => dispatch(setNewMessagesCountAction(data)),
  }
}

const mapStateToProps = (state) => {
  return { newMessagesCount: state.newMessagesCount }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

const marginTop = 0
const style = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    marginTop: 16,
    fontFamily: NUNITO_SANS_BOLD,
  },
  userImg: {
    width: 80,
    height: 80,
    borderRadius: 60,
    borderColor: WHITE_COLOR,
    borderWidth: 4,
    marginTop,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    color: BLACK_COLOR_OPACITY(0.6),
    fontFamily: NUNITO_SANS_BOLD,
  },
  didTouchable: {
    height: 50,
    marginVertical: 16,
    paddingHorizontal: 43,
  },
  qr: {
    width: 240,
    height: 240,
    borderRadius: 12,
    padding: 17,
    backgroundColor: WHITE_COLOR,

    shadowColor: BLACK_ORIGIN_COLOR,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    elevation: 3,
  },
  notes: {
    marginVertical: 24,
    paddingHorizontal: 43,
    textAlign: 'center',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR_OPACITY(0.4),
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    position: 'absolute',
    right: -8,
    top: -7,
    minHeight: 15,
    minWidth: 15,
    backgroundColor: '#FF6E6E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  network: {
    backgroundColor: ORANGE_COLOR,
    color: WHITE_COLOR,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 10,
    borderRadius: 10,
  },
  scanQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    borderRadius: 4,
  },
  scanQRButtonText: {
    marginLeft: 10,
    color: '#041133',
    fontSize: 16,
  },
})
