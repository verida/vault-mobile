import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { editable } from 'helpers/profile'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import Snackbar from 'react-native-snackbar'
import { connect, useSelector } from 'react-redux'
import { Dispatch } from 'redux'

import AccountManager from 'api/AccountManager'
import VeridaOneManager from 'api/VeridaOneManager'
import EditIcon from 'assets/edit_icon.svg'
import Button from 'components/Button'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import ProfileImageLoader from 'components/ProfileImageLoader'
import PropertyList from 'components/PropertyList'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import { CaipWalletType, VeridaWallet } from 'components/types/wallet'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { setPublicProfileData } from 'reduxStore/general/actions'
import { selectChains } from 'reduxStore/tokens/selectors'
import { allWalletsSelector } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

interface PublicAddress {
  address: string
  chain: string
  name: string
  order: number

  visible: boolean
  veridaWalletName: string
  description: string
  icon: string
}

const PublicProfile = ({ publicProfileData, updatePublicProfileData }: any) => {
  const [list, setList] = useState([
    { label: 'Name', value: '', action: 'arrow', type: 'input' },
    { label: 'Country', value: '', action: 'arrow', type: 'select' },
    { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
  ])
  const { theme } = useTheme()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publicProfile, setPublicProfile] = useState(publicProfileData)
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    VeridaWallet
  >
  const chains = useSelector(selectChains)
  const styles = useThemeAwareStyle(createStyles)
  const [publicWalletAddresses, setPublicWalletAddresses] = useState<
    PublicAddress[]
  >([])

  function isVisible(address: string) {
    return (
      publicWalletAddresses.findIndex(
        (walletAddress) => walletAddress.address === address
      ) >= 0
    )
  }

  function getPublicName(address: string) {
    // TODO: find name in public profile data
    return address
  }

  function findChainFromChainId(chainId: string) {
    return Object.values(chains).find(
      (chain: any) => chain.addressMapping === chainId
    )
  }

  function getChainId(chainData) {
    return `${chainData.namespace}:${chainData.reference}`
  }

  const walletAddresses = useMemo<PublicAddress[]>(() => {
    return Object.keys(wallets)
      .reduce((acc, key) => {
        const wallet = wallets[key]
        const accounts = Object.keys(wallet.accounts).map(
          (accountKey, index) => {
            const account = wallet.accounts[accountKey as CaipWalletType]
            const chain = findChainFromChainId(accountKey) as any
            return {
              address: account.address,
              chainId: getChainId(chain.data),
              label: getPublicName(account.address),
              order: index,

              // Infered value for displaying
              veridaWalletName: wallet.label,
              visible: isVisible(account.address),
              icon: chain?.icon,
            }
          }
        )

        acc.push(...accounts)

        return acc
      }, [] as PublicAddress[])
      .sort((a, b) => {
        return a.order - b.order
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, publicWalletAddresses])

  async function setPublicAddress(
    publicAdress: PublicAddress,
    visible: boolean
  ) {
    const savePublicAddress = { ...publicAdress }

    // Delete metadata
    delete savePublicAddress.visible
    delete savePublicAddress.icon
    delete savePublicAddress.veridaWalletName

    let newPublicWalletAddresses = [...publicWalletAddresses]

    if (visible) {
      newPublicWalletAddresses.push(savePublicAddress)
      Snackbar.show({
        text: 'Added to Verida One profile',
        duration: Snackbar.LENGTH_SHORT,
      })
    } else {
      newPublicWalletAddresses = newPublicWalletAddresses.filter(
        (walletAddress) => walletAddress.address !== publicAdress.address
      )
      Snackbar.show({
        text: 'Hidden from Verida One profile',
        duration: Snackbar.LENGTH_SHORT,
      })
    }

    setPublicWalletAddresses(newPublicWalletAddresses)
    debounceSaveProfile(newPublicWalletAddresses)
  }

  const debounceSaveProfile = useCallback(
    debounce(async (_walletAddresses) => {
      try {
        setSaving(true)
        await VeridaOneManager.setWalletAddresses([..._walletAddresses])
      } catch (e) {
        Sentry.captureException(e)
        Alert.alert('Error', 'Failed to save profile')
      } finally {
        setSaving(false)
      }
    }, 1000),
    []
  )

  const fetchData = async () => {
    try {
      const vault = AccountManager.getInstance().vault as any
      const publicData = await vault.profiles.public.getMany()

      setPublicProfile(publicData)

      updatePublicProfileData(publicData || publicProfileData)
      const updatedList = list.map((item: any) => {
        const label = item.label.toLowerCase()
        if (publicData[label]) {
          item.value = publicData[label]
        }
        return item
      })

      setList(updatedList)
    } catch (e) {
      Sentry.captureException(e)
      Alert.alert('Error', 'Cannot load public profile data')
    }
  }

  const fetchVeridaOneProfle = async () => {
    // Fetch Verida One Profile
    try {
      const oneProfile = (await VeridaOneManager.getProfile()) as any
      setPublicWalletAddresses(oneProfile.walletAddresses)
    } catch (e) {
      Sentry.captureException(e)
      Alert.alert('Error', 'Cannot load Verida profile data')
    }
  }

  // component did mount
  useEffect(() => {
    setLoading(true)
    Promise.all([fetchData(), fetchVeridaOneProfle()]).finally(() => {
      setLoading(false)
    })

    let listener: any
    const watchChanges = async () => {
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.init()
      const db = await vault.profiles.public.store.getDb()
      const dbInstance = db.db
      listener = dbInstance
        .changes({
          since: 'now',
          live: true,
        })
        .on('change', () => {
          fetchData()
        })
    }
    watchChanges()
    return () => {
      listener?.cancel()
    }
    // Register profile change listener one time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen
      backgroundGrey
      loadingOverlayColorLight
      withLoadingView
      showLoading={saving}>
      <NavigationHeader title='Profile' left={{ icon: null } as any} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xxxl,
          }}>
          <ProfileImageLoader />
          <View style={styles.oneProfileLinkContainer}>
            <Image
              style={{
                position: 'absolute',
                width: '100%',
              }}
              resizeMode='stretch'
              source={require('assets/profile_banner_bg.png')}
            />
          </View>
          <View>
            <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
            <PropertyList list={editable(list)} />
          </View>
          <Text style={styles.description}>
            This information is always visible on your Verida One page
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text style={styles.sectionHeader}>WALLET ADDRESS</Text>
            <Button
              textStyle={{
                fontSize: theme.fontSize.m,
                marginBottom: theme.spacing.s,
              }}
              color='transparent-link'
              onPress={() => navigation.navigate('ManageWallets')}>
              ADD NEW
            </Button>
          </View>
          {walletAddresses.map((walletAddress) => {
            return (
              <View
                key={walletAddress.address}
                style={styles.walletItemContainer}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                      }}>
                      <FastImage
                        source={{ uri: walletAddress.icon }}
                        style={{ width: 48, height: 48 }}
                        resizeMode='contain'
                      />
                      <View style={{ marginLeft: theme.spacing.m }}>
                        <SubHeadline
                          style={{
                            color: walletAddress.name
                              ? theme.color.onBackground
                              : theme.color.textLightGrey,
                          }}>
                          {walletAddress.name || 'Public title'}
                        </SubHeadline>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            ellipsizeMode='middle'
                            numberOfLines={1}
                            style={{
                              maxWidth: 100,
                              marginRight: theme.spacing.xs,
                            }}>
                            {walletAddress.address}
                          </Text>
                          <Text style={styles.veridaWalletName}>
                            {walletAddress.veridaWalletName}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Button
                      color={'transparent'}
                      style={{
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        // editWalletName()
                      }}>
                      <EditIcon />
                    </Button>
                  </View>
                  <View
                    style={{
                      marginVertical: theme.spacing.s,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: 'rgba(205, 207, 214, 1)',
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text>Display on Verida One profile</Text>
                    <Switch
                      trackColor={{
                        false: '#767577',
                        true: theme.color.success,
                      }}
                      ios_backgroundColor='#131313'
                      onValueChange={(value) => {
                        setPublicAddress(walletAddress, value)
                      }}
                      value={walletAddress.visible}
                    />
                  </View>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </Screen>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    updatePublicProfileData: (data: unknown) =>
      dispatch(setPublicProfileData(data)),
  }
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  return {
    publicProfileData: state.publicProfileData,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicProfile)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    description: {
      marginVertical: theme.spacing.s,
      color: theme.color.onBackground,
      opacity: 0.4,
      fontSize: theme.fontSize.s,
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      color: theme.color.onBackground,
      opacity: 0.6,
      marginBottom: theme.spacing.s,
    },
    walletItemContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.color.background,
      borderColor: theme.color.lightGrey,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
    oneProfileLinkContainer: {
      position: 'relative',
      width: '100%',
      height: 140,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: Dimensions.get('window').height * 0.8,
    },
    veridaWalletName: {
      fontSize: theme.fontSize.s,
      color: theme.color.textLightGrey,
    },
  })
