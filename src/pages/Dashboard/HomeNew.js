import dynamicLinks from '@react-native-firebase/dynamic-links'
import { useFocusEffect, useLinkTo } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { logout as logoutAction } from 'features/auth'
import { selectSelectedAccount } from 'features/identities'
import {
  selectNewMessagesCount,
  setNewMessagesCount as setNewMessagesCountAction,
} from 'features/inbox'
import {
  selectNavigationLink,
  setNavigationLink as setNavigationLinkAction,
} from 'features/links'
import { selectPublicProfile } from 'features/profiles'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  InteractionManager,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import parse from 'url-parse'

import AccountManager from 'api/AccountManager'
import { fetchInboxCount, getProfile } from 'api/utils'
import LoadingView from 'components/LoadingView'
import {
  BACKGROUND_GREY_COLOR,
  LIGHT_ORANGE_COLOR,
  WHITE_COLOR,
} from 'constants/color'
import { PROFILE_URL } from 'constants/url'
import { useAuth } from 'hooks/useAuth'
import { useDeeplink } from 'hooks/useDeeplink'
import { useRemoteNotifications } from 'hooks/useRemoteNotifications'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import AddAccountsModal from 'pages/Dashboard/AddAccountsModal'
import SeedPhraseRemindView from 'pages/Dashboard/SeedPhraseRemindView'

import PromoBannersCarousel from './Banners/CarouselBanner'
import WalletSummary from './Banners/WalletBanner'
import DidView from './DidView'
import GettingStarted from './GettingStarted/GettingStartedSection'
import HomeNavigationHeader from './HomeNavigationHeader'
import QRCodeScannerButton from './QrcodeScanner'

const DefaultAvatar = require('assets/stubs/avatar.png')

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
      // ignore for firebase links, let firebase handle them.
      if (
        !initialUrl ||
        initialUrl.includes('redirect') ||
        initialUrl.includes('verida.page.link')
      )
        return

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
    <View style={style.container}>
      <HomeNavigationHeader
        did={info.did || ''}
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
      {loading ? (
        <LoadingView />
      ) : (
        <ScrollView
          style={style.scrollContainer}
          contentContainerStyle={style.content}>
          <View>
            <View style={style.section}>
              <WalletSummary />
            </View>
            <View style={[style.section, style.promoBannersCarouselSection]}>
              <PromoBannersCarousel />
            </View>
            <View style={style.section}>
              <GettingStarted />
            </View>
          </View>
          <View>
            <View style={style.section}>
              <QRCodeScannerButton onPress={onScanQRPress} />
            </View>
            <View>
              <DidView did={info.did || ''} />
            </View>
          </View>
        </ScrollView>
      )}

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
    </View>
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
    navigationLink: selectNavigationLink(state),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_GREY_COLOR,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  promoBannersCarouselSection: {
    marginLeft: -16,
    marginRight: -16,
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
