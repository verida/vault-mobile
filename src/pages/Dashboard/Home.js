import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import * as SecureStore from 'expo-secure-store'
import { Container, Content, View } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  InteractionManager,
  Linking,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import parse from 'url-parse'

import AccountManager from 'api/AccountManager'
import { fetchInboxCount, getProfile } from 'api/utils'
import LoadingView from 'components/LoadingView'
import {
  BACKGROUND_GREY_COLOR,
  BLACK_COLOR_OPACITY,
  BLACK_ORIGIN_COLOR,
  LIGHT_ORANGE_COLOR,
  ORANGE_COLOR,
  TEXT_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { FIRST_TIME_LOGIN_KEY } from 'constants/storage'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { PROFILE_URL } from 'constants/url'
import { useAuth } from 'hooks/useAuth'
import { useDeeplink } from 'hooks/useDeeplink'
import { useRemoteNotifications } from 'hooks/useRemoteNotifications'
import { CreateAccountMode } from 'pages/Account/Create'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'
import {
  logout as logoutAction,
  setNavigationLink as setNavigationLinkAction,
  setNewMessagesCount as setNewMessagesCountAction,
} from 'reduxStore/general/actions'

import CarouselBanner from './Banners/CarouselBanner'
import WalletBanner from './Banners/WalletBanner'
import DidView from './DidView'
import GettingStartedSection from './GettingStarted/GettingStartedSection'
import HomeNavigationHeader from './HomeNavigationHeader'
import QRCodeScannerSection from './QrcodeScanner'

const DefaultAvatar = require('assets/stubs/avatar.png')

const SHOW_BANNER_KEY = 'show_banner'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const Home = (props) => {
  const {
    navigation,
    selectedAccount,
    publicProfileData,
    navigationLink,
    setNavigationLink,
    logout,
  } = props
  const [info, setInfo] = useState({})
  const [avatarSource, setAvatarSource] = useState(DefaultAvatar)
  const [loading, setLoading] = useState(true)
  const [showAddAccounts, setShowAddAccounts] = useState(false)
  const handleDeeplink = useDeeplink(navigation)
  const { switchToAccount, refresh } = useAuth()
  useRemoteNotifications()
  const linkTo = useLinkTo()
  const processDeepLink = (initialUrl) => {
    if (initialUrl === null) {
      return
    }
    // ignore for firebase links, let firebase handle them.
    if (
      initialUrl.includes('redirect') ||
      initialUrl.includes('verida.page.link')
    ) {
      return
    }

    handleDeeplink(initialUrl)
  }

  useEffect(() => {
    const getUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL()
        processDeepLink(initialUrl)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    getUrl()
  }, [handleDeeplink])

  useEffect(() => {
    const handleBackgroundDeepLink = async (event) => {
      try {
        const initialUrl = event.url
        processDeepLink(initialUrl)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    Linking.addEventListener('url', handleBackgroundDeepLink)
  }, [handleDeeplink])

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(async (link) => {
        if (link?.url?.includes('redirect')) {
          try {
            const parsedUrl = parse(link.url, true)
            const { query } = parsedUrl
            await Linking.openURL(
              'https://www.google.com/search?q=' + query.keyword
            )
          } catch (error) {
            Sentry.captureException(error)
          }
        }
      })
  }, [])

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
          address: PROFILE_URL + _selectedAccount.did,
          name,
          did: _selectedAccount.did,
        })
        const showBanner = await SecureStore.getItemAsync(SHOW_BANNER_KEY)
        if (!showBanner || showBanner !== 'set') {
          Alert.alert(
            'Important Notice',
            'Testnet 1 data has been reset, if you are unable to access your accounts, this is normal. You can now create new accounts in such cases.'
          )
          await SecureStore.setItemAsync(SHOW_BANNER_KEY, 'set')
        }
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
    try {
      await switchToAccount(did)
    } catch (e) {
      Alert.alert(
        'Error',
        'Cannot get account information, removing this account'
      )
      setLoading(true)
      await AccountManager.getInstance().logout([did])
      await refresh()
      setLoading(false)
    }
  }

  async function onLogoutAccounts(dids) {
    setLoading(true)
    // Only flush Redux store if the current account is logged out
    if (dids.includes(AccountManager.getInstance().getSelectedAccount().did)) {
      logout()
    }
    await AccountManager.getInstance().logout(dids)
    await refresh()
    props.navigation.navigate('Home')
    setLoading(false)
  }

  function onRecordSeedPhrase() {
    navigation.navigate('SeedPhrase')
  }

  return (
    <Container style={style.container}>
      <HomeNavigationHeader
        did={info.did || ''}
        name={info.name || ''}
        avatar={avatarSource}
        inboxCount={props.newMessagesCount}
        onNamePress={toggleAddAccountsModal}
        onAvatarPress={() => props.navigation.navigate('PublicProfile')}
        onInboxPress={() => props.navigation.navigate('Inbox')}
        onSettingsPress={() =>
          props.navigation.navigate('Settings', {
            onSelectAccount,
            onLogoutAccounts,
          })
        }
      />
      <Content contentContainerStyle={style.content}>
        {loading ? (
          <LoadingView style={style.loading} />
        ) : (
          <>
            <View style={style.walletBannerSection}>
              <WalletBanner />
            </View>
            <View style={style.carouselSection}>
              <CarouselBanner />
            </View>
            <View style={style.gettingStartedSection}>
              <GettingStartedSection />
            </View>
            <View style={style.qrSection}>
              <QRCodeScannerSection onScanQRPress={onScanQRPress} />
            </View>
          </>
        )}
      </Content>
      <AddAccountsModal
        visible={showAddAccounts}
        onClose={toggleAddAccountsModal}
        onAddNew={onAddAccount}
        onImport={onImportAccount}
        onSelectAccount={onSelectAccount}
        onLogoutAccounts={onLogoutAccounts}
      />
      <DidView did={info.did || ''} />
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
    logout: () => dispatch(logoutAction()),
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
const WIDTH = '100%'
const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: BACKGROUND_GREY_COLOR,
  },
  walletBannerSection: {
    width: WIDTH,
    marginVertical: 16,
  },
  carouselSection: {
    width: WIDTH,
    marginBottom: 30,
  },
  gettingStartedSection: {
    width: WIDTH,
  },
  qrSection: {
    width: WIDTH,
    marginTop: 40,
    marginBottom: 21,
  },
  loading: {
    height: 700,
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
    color: TEXT_COLOR,
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
  tempButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    borderRadius: 4,
  },
  tempButtonText: {
    marginLeft: 5,
    color: TEXT_COLOR,
    fontSize: 8,
  },
})
