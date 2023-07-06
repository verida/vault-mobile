import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { selectSelectedAccount } from 'features/identities'
import {
  selectNewMessagesCount,
  setNewMessagesCount as setNewMessagesCountAction,
} from 'features/inbox'
import { selectPublicProfile } from 'features/profiles'
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
import parse from 'url-parse'

import AccountManager from 'api/AccountManager'
import { fetchInboxCount, getProfile } from 'api/utils'
import QRCodeIcon from 'assets/icons/qr-code.svg'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import {
  BLACK_COLOR_OPACITY,
  BLACK_ORIGIN_COLOR,
  LIGHT_ORANGE_COLOR,
  ORANGE_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { PROFILE_URL } from 'constants/url'
import { useAuth } from 'hooks/useAuth'
import { useDeeplink } from 'hooks/useDeeplink'
import { useRemoteNotifications } from 'hooks/useRemoteNotifications'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import DidView from 'pages/Dashboard/DidView'
import HomeNavigationHeader from 'pages/Dashboard/HomeNavigationHeader'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'
import {
  logout as logoutAction,
  setNavigationLink as setNavigationLinkAction,
} from 'reduxStore/general/actions'

const DefaultAvatar = require('assets/stubs/avatar.png')
const LogoImg = require('assets/vault-logo.png')

// const SHOW_BANNER_KEY = 'show_banner'

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

  const processDeepLink = React.useCallback(
    (initialUrl) => {
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
    },
    [handleDeeplink]
  )

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

    // TODO: We are not sensitive to processDeepLink here, but we should be.
    //       This is for backwards-compatible linter satisfaction only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // TODO: We are not sensitive to processDeepLink here, but we should be.
    //       This is for backwards-compatible linter satisfaction only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    let isMounted = true
    const initProfile = async () => {
      try {
        setLoading(true)
        const _selectedAccount =
          AccountManager.getInstance().getSelectedAccount()
        const { name, avatar } = await getProfile(_selectedAccount.did)

        if (!isMounted) return

        setAvatarSource(avatar)

        setInfo({
          address: PROFILE_URL + _selectedAccount.did,
          name,
          did: _selectedAccount.did,
        })
        // const showBanner = await SecureStore.getItemAsync(SHOW_BANNER_KEY)
        // if (!showBanner || showBanner !== 'set') {
        //   Alert.alert(
        //     'Important Notice',
        //     'Testnet 1 data has been reset, if you are unable to access your accounts, this is normal. You can now create new accounts in such cases.'
        //   )
        //   await SecureStore.setItemAsync(SHOW_BANNER_KEY, 'set')
        // }
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

    return () => {
      isMounted = false
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
      navigation.navigate('Identity', {
        mode: AddIdentityMode.Add,
        previousScreen: 'Dashboard',
      })
    })
  }

  function onImportAccount() {
    toggleAddAccountsModal()
    navigation.navigate('SeedPhraseEntered', { previousScreen: 'Dashboard' })
  }

  async function onSelectAccount(did) {
    const currentDid = AccountManager.getInstance().selectedAccount.did
    if (did === currentDid) {
      return
    }

    toggleAddAccountsModal()
    try {
      await switchToAccount(did)
    } catch (e) {
      Alert.alert(
        'Error',
        `Unable to switch to that account, please try again later.`
      )

      // Switch back to the current account
      await switchToAccount(currentDid)
      await refresh()
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
    <Container>
      <HomeNavigationHeader
        name={info.name || ''}
        avatar={avatarSource}
        inboxCount={props.newMessagesCount}
        onNamePress={toggleAddAccountsModal}
        onAvatarPress={() => props.navigation.navigate('Profile')}
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
      <DidView did={info.did || ''} />
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
    logout: () => dispatch(logoutAction()),
  }
}

const mapStateToProps = (state) => {
  return {
    publicProfileData: selectPublicProfile(state),
    newMessagesCount: selectNewMessagesCount(state),
    selectedAccount: selectSelectedAccount(state),
    navigationLink: state.main.navigationLink,
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
    color: '#041133',
    fontSize: 8,
  },
})
