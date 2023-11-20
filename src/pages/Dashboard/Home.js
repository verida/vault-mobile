import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import { logout as logoutAction } from 'features/auth'
import { isCryptoRequestDeepLink } from 'features/cryptoWallet'
import { useDeeplink } from 'features/deepLinks'
import { selectSelectedAccount } from 'features/identities'
import {
  selectNavigationLink,
  setNavigationLink as setNavigationLinkAction,
} from 'features/links'
import { isPolygonIdDeepLink } from 'features/polygonid'
import { Logger } from 'features/telemetry'
import { Content } from 'native-base'
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
import parse from 'url-parse'

import AccountManager from 'api/AccountManager'
import { fetchInboxCount } from 'api/utils'
import QRCodeIcon from 'assets/icons/qr-code.svg'
import Container from 'components/Container'
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
import { useRemoteNotifications } from 'hooks/useRemoteNotifications'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import DidView from 'pages/Dashboard/DidView'
import HomeNavigationHeader from 'pages/Dashboard/HomeNavigationHeader'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'
import { useAppDispatch, useAppSelector } from 'reduxStore/types'

const logger = new Logger('Pages/Dashboard/Home')

const LogoImg = require('assets/vault-logo.png')

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

export const HomeTabScreen = (props) => {
  const { navigation } = props
  const [loading, setLoading] = useState(false)
  const [showAddAccounts, setShowAddAccounts] = useState(false)
  const dispatch = useAppDispatch()
  const selectedAccount = useAppSelector(selectSelectedAccount)
  const navigationLink = useAppSelector(selectNavigationLink)
  const setNavigationLink = useCallback(
    (link) => dispatch(setNavigationLinkAction(link)),
    [dispatch]
  )
  const logout = () => dispatch(logoutAction({ did: selectedAccount?.did }))

  const handleDeeplink = useDeeplink(navigation)
  const { switchToAccount, refresh } = useAuth()
  const linkTo = useLinkTo()
  const qrAddress = selectedAccount?.did
    ? PROFILE_URL + selectedAccount?.did
    : ''

  useRemoteNotifications()

  // TODO: Clean up and migrate all the deeplink handlers here to their respective features/protocols
  const processDeepLink = React.useCallback(
    (initialUrl) => {
      if (initialUrl === null) {
        return
      }

      // Ignore PolygonID deeplink here, as it's handled in features/protocolHandlers
      if (
        isPolygonIdDeepLink(initialUrl) ||
        isCryptoRequestDeepLink(initialUrl)
      ) {
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
      } catch (error) {
        logger.error(error)
      }
    }

    getUrl()
  }, [processDeepLink])

  useEffect(() => {
    const handleBackgroundDeepLink = async (event) => {
      try {
        const initialUrl = event.url
        processDeepLink(initialUrl)
      } catch (error) {
        logger.error(error)
      }
    }

    const subscriber = Linking.addEventListener('url', handleBackgroundDeepLink)
    return () => {
      subscriber?.remove()
    }
  }, [processDeepLink])

  useEffect(() => {
    // TODO: Find out what's going on here :-/
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
            logger.error(error)
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

  // TODO: remove, and refactor the inbox count feature
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
    InteractionManager.runAfterInteractions(async () => {
      //  // Not a good practice, though this helps to prevent a crash related to iOS animation
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 500)
      })

      try {
        await switchToAccount(did)
      } catch (error) {
        Alert.alert(
          'Error',
          `Unable to switch to that account, please try again later.`
        )

        // Switch back to the current account
        await switchToAccount(currentDid)
        await refresh()
      }
    })
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
              {Boolean(qrAddress) && (
                <QRCode
                  logo={LogoImg}
                  logoSize={60}
                  size={207}
                  codeStyle='dot'
                  innerEyeStyle='circle'
                  padding={0.5}
                  content={qrAddress}
                />
              )}
            </View>
            <Text style={style.notes}>
              This is your QR-Code. Present it to others so they can scan it and
              connect to you
            </Text>
            <View>
              <TouchableOpacity
                style={style.scanQRButton}
                onPress={onScanQRPress}>
                <QRCodeIcon />
                <Text style={style.scanQRButtonText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Content>
      {Boolean(selectedAccount?.did) && <DidView did={selectedAccount.did} />}
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
    alignItems: 'center',
    justifyContent: 'center',
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
