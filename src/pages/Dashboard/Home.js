import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  InteractionManager,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { QRCode } from 'react-native-custom-qr-codes-expo'
import { connect } from 'react-redux'

import Text from 'components/Text'
import { Container, Content } from 'native-base'
import { useDeeplink } from 'hooks/useDeeplink'
import QRCodeIcon from 'assets/icons/qr-code.svg'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import {
  BLACK_COLOR_OPACITY,
  BLACK_ORIGIN_COLOR,
  LIGHT_ORANGE_COLOR,
  ORANGE_COLOR,
  WHITE_COLOR,
} from '../../constants/color'
import { setNewMessagesCount as setNewMessagesCountAction } from '../../reduxStore/general/actions'

import { fetchInboxCount, loadAvatarSource } from 'api/utils'
import LoadingView from 'components/LoadingView'
import * as SecureStore from 'expo-secure-store'
import * as Sentry from '@sentry/react-native'
import { FIRST_TIME_LOGIN_KEY } from 'constants/storage'
import AccountManager from 'api/AccountManager'
import HomeNavigationHeader from 'pages/Dashboard/HomeNavigationHeader'
import DidView from 'pages/Dashboard/DidView'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import { useAuth } from 'hooks/useAuth'
import { useFocusEffect } from '@react-navigation/native'
import useSeedPhraseReminder from 'hooks/useSeedPhraseReminder'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'

const DefaultAvatar = require('../../assets/stubs/avatar.png')
const LogoImg = require('../../assets/vault-logo.png')
const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const Home = (props) => {
  const { navigation, selectedAccount, publicProfileData } = props
  const [info, setInfo] = useState({})
  const [avatarSource, setAvatarSource] = useState(DefaultAvatar)
  const [loading, setLoading] = useState(true)
  const [showAddAccounts, setShowAddAccounts] = useState(false)
  const handleDeeplink = useDeeplink(navigation)
  const { switchToAccount, refresh } = useAuth()
  const { shouldShowReminder, hideReminder } = useSeedPhraseReminder()

  useEffect(() => {
    const getUrl = async () => {
      const initialUrl = await Linking.getInitialURL()

      if (initialUrl === null) {
        return
      }

      handleDeeplink(initialUrl)
    }

    getUrl()
  }, [handleDeeplink])

  useEffect(() => {
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
  }, [navigation])

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true)
        const accountManager = AccountManager.getInstance()
        const name = await accountManager.vault.profiles.public.get('name')
        const source = await loadAvatarSource()
        setAvatarSource(source)

        setInfo({
          address: accountManager.selectedAccount.did,
          name,
        })

        setLoading(false)
      } catch (e) {
        Sentry.captureException(e)
        Alert.alert('Error', 'Cannot get account information')
        setLoading(false)
      }
    }

    if (selectedAccount && publicProfileData) {
      initProfile()
    }
  }, [selectedAccount, publicProfileData])

  useFocusEffect(() => {
    fetchInboxCount()
  })

  function onScanQRPress() {
    navigation.navigate('ScanQrCode', {
      firstTime: false,
    })
  }

  function toggleAddAccountsModal() {
    setShowAddAccounts((prevState) => !prevState)
  }

  function onAddAccount() {
    toggleAddAccountsModal()
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate('AddAccount')
    })
  }

  function onImportAccount() {
    toggleAddAccountsModal()
    navigation.navigate('ImportAccount')
  }

  async function onSelectAccount(did) {
    if (did === AccountManager.getInstance().selectedAccount.did) {
      return
    }

    toggleAddAccountsModal()
    await switchToAccount(did)
  }

  async function onLogoutAccounts(dids) {
    await AccountManager.getInstance().logout(dids)
    await refresh()
  }

  function onRecordSeedPhrase() {
    navigation.navigate('SeedPhrase')
  }

  return (
    <Container>
      <HomeNavigationHeader
        name={info.name || ''}
        avatar={avatarSource}
        inboxCount={props.newMessagesCount}
        onNamePress={toggleAddAccountsModal}
        onAvatarPress={() => props.navigation.navigate('PublicProfile')}
        onInboxPress={() => props.navigation.navigate('Inbox')}
        onSettingsPress={() => props.navigation.navigate('Settings')}
      />
      <Content contentContainerStyle={style.content}>
        {loading ? (
          <LoadingView />
        ) : (
          <>
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
      <DidView did={info.address || ''} />
      <AddAccountsModal
        visible={showAddAccounts}
        onClose={toggleAddAccountsModal}
        onAddNew={onAddAccount}
        onImport={onImportAccount}
        onSelectAccount={onSelectAccount}
        onLogoutAccounts={onLogoutAccounts}
      />
      {shouldShowReminder && (
        <SeedPhraseRemindView
          onRecordPress={onRecordSeedPhrase}
          onClosePress={hideReminder}
          style={style.seedPhraseRemindView}
        />
      )}
    </Container>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setNewMessagesCount: (data) => dispatch(setNewMessagesCountAction(data)),
  }
}

const mapStateToProps = (state) => {
  return {
    publicProfileData: state.publicProfileData,
    newMessagesCount: state.newMessagesCount,
    selectedAccount: state.selectedAccount,
  }
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
  seedPhraseRemindView: {
    position: 'absolute',
    bottom: 16,
    left: 15,
    width: SCREEN_WIDTH - 30,
    backgroundColor: LIGHT_ORANGE_COLOR,
    borderRadius: 3,
  },
})
