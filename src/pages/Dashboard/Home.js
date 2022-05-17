import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import * as SecureStore from 'expo-secure-store'
import { Container, Content } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
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

import AccountManager from 'api/AccountManager'
import { fetchInboxCount, getProfile } from 'api/utils'
import QRCodeIcon from 'assets/icons/qr-code.svg'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { FIRST_TIME_LOGIN_KEY } from 'constants/storage'
import { useAuth } from 'hooks/useAuth'
import { useDeeplink } from 'hooks/useDeeplink'
import { useRemoteNotifications } from 'hooks/useRemoteNotifications'
import { CreateAccountMode } from 'pages/Account/Create'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import DidView from 'pages/Dashboard/DidView'
import HomeNavigationHeader from 'pages/Dashboard/HomeNavigationHeader'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'

import {
  BLACK_COLOR_OPACITY,
  BLACK_ORIGIN_COLOR,
  LIGHT_ORANGE_COLOR,
  ORANGE_COLOR,
  WHITE_COLOR,
} from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import {
  setNavigationLink as setNavigationLinkAction,
  setNewMessagesCount as setNewMessagesCountAction,
} from '../../reduxStore/general/actions'

const DefaultAvatar = require('../../assets/stubs/avatar.png')
const LogoImg = require('../../assets/vault-logo.png')

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const Home = (props) => {
  const {
    navigation,
    selectedAccount,
    publicProfileData,
    navigationLink,
    setNavigationLink,
  } = props
  const [info, setInfo] = useState({})
  const [avatarSource, setAvatarSource] = useState(DefaultAvatar)
  const [loading, setLoading] = useState(true)
  const [showAddAccounts, setShowAddAccounts] = useState(false)
  const handleDeeplink = useDeeplink(navigation)
  const { switchToAccount, refresh } = useAuth()
  useRemoteNotifications()
  const linkTo = useLinkTo()

  useEffect(() => {
    const getUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()

        if (initialUrl === null) {
          return
        }

        handleDeeplink(initialUrl)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    getUrl()
  }, [handleDeeplink])

  useEffect(() => {
    if (navigationLink) {
      InteractionManager.runAfterInteractions(() => {
        linkTo(navigationLink)
        setNavigationLink(null)
      })
    }
  }, [navigationLink, linkTo, setNavigationLink])

  useEffect(() => {
    async function checkFirstTimeLogin() {
      try {
        const isFirstTimeLogin = await SecureStore.getItemAsync(
          FIRST_TIME_LOGIN_KEY
        )
        if (isFirstTimeLogin) {
          await SecureStore.deleteItemAsync(FIRST_TIME_LOGIN_KEY)
          navigation.navigate('ScanQrCode', {
            firstTime: true,
          })
        }
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    checkFirstTimeLogin()
  }, [navigation])

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true)
        const _selectedAccount =
          AccountManager.getInstance().getSelectedAccount()
        const { name, avatar } = await getProfile(_selectedAccount.did)
        setAvatarSource(avatar)

        setInfo({
          address: _selectedAccount.did,
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

  useFocusEffect(
    useCallback(() => {
      fetchInboxCount()
    }, [])
  )

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
      navigation.navigate('AddAccount', { mode: CreateAccountMode.ADD })
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
      <SeedPhraseRemindView
        onRecordPress={onRecordSeedPhrase}
        style={style.seedPhraseRemindView}
      />
    </Container>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setNewMessagesCount: (data) => dispatch(setNewMessagesCountAction(data)),
    setNavigationLink: (link) => dispatch(setNavigationLinkAction(link)),
  }
}

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    publicProfileData: state.publicProfileData,
    newMessagesCount: state.newMessagesCount,
    selectedAccount: state.selectedAccount,
    navigationLink: state.navigationLink,
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
