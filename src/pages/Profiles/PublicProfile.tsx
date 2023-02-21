import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import {
  checkVeridaOneInviteCode,
  editable,
  isEnabledVeridaOneProfile,
  saveStatusEnabledVeridaOneProfile,
  VERIDA_ONE_INVITE_CODE,
} from 'helpers/profile'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Dimensions,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  RenderItemParams,
} from 'react-native-draggable-flatlist'
import Snackbar from 'react-native-snackbar'
import { connect, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { PublicWalletAddress } from 'types/profile'
import { CaipWalletType, VeridaWallet } from 'types/wallet'

import AccountManager from 'api/AccountManager'
import VeridaOneManager from 'api/VeridaOneManager'
import Button from 'components/Button'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import ProfileImageLoader from 'components/ProfileImageLoader'
import PropertyList from 'components/PropertyList'
import { WalletAddressItem } from 'components/PublicProfile'
import Screen from 'components/Screen'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { useEmitter } from 'hooks/useEmitter'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { setPublicProfileData } from 'reduxStore/general/actions'
import { selectChains } from 'reduxStore/tokens/selectors'
import { allWalletsSelector } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

enum EditMode {
  EditWalletPublicLabel,
  EnterInvitationCode,
}

const ScreenName = 'PublicProfile'

const PublicProfile = ({ publicProfileData, updatePublicProfileData }: any) => {
  const [list, setList] = useState([
    { label: 'Name', value: '', action: 'arrow', type: 'input' },
    { label: 'Country', value: '', action: 'arrow', type: 'select' },
    { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
  ])

  const [userInfoReadOnlyItem] = useState([
    {
      label: 'DID',
      value: AccountManager.getInstance().getSelectedAccount()?.did ?? '',
      action: 'copy',
    },
  ])

  const { theme } = useTheme()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [quickFetching, setQuickFetching] = useState(false) // Manage a lighter loading indicator for a better UX
  const [, setPublicProfile] = useState(publicProfileData)
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    VeridaWallet
  >
  const selectedAccount = useSelector(
    (state: any) => state.main.selectedAccount
  )
  const currentAccountDID =
    selectedAccount?.did ??
    AccountManager.getInstance().getSelectedAccount()?.did

  const chains = useSelector(selectChains)
  const styles = useThemeAwareStyle(createStyles)
  const [publicWalletAddresses, setPublicWalletAddresses] = useState<
    PublicWalletAddress[]
  >([])

  const [publicCustomLinks, setPublicCustomLinks] = useState<any[]>([])

  const [enabledVeridaOne, setEnabledVeridaOne] = useState(false)

  // pull to refresh data
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    Promise.all([fetchData(), fetchVeridaOneProfle()]).finally(() => {
      setRefreshing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPublicWalletAddressObject = useCallback(
    (address: string, chainId: string) => {
      return publicWalletAddresses.find(
        (walletAddress) =>
          walletAddress.address === address && walletAddress.chainId === chainId
      )
    },
    [publicWalletAddresses]
  )

  const getPublicAdrressOrder = useCallback(
    (address: string, chainId: string) => {
      const publicWalletAddress = getPublicWalletAddressObject(address, chainId)
      return publicWalletAddress?.order ?? 0
    },
    [getPublicWalletAddressObject]
  )

  function getChainId(chainData: any) {
    // FIXME: Remove this hack of trimming the Algorand chain ID reference to make it follow the CAIP address rule
    let chainRef = chainData.reference
    if (chainData.namespace === 'algorand') {
      chainRef = chainRef.substring(0, 32)
    }
    return `${chainData.namespace}:${chainRef}`
  }

  const updateWalletAddressesOrder = useCallback(
    (walletAddressesOrder) => {
      let orderNumber = 0
      const newPublicAddresses = [...publicWalletAddresses]
      walletAddressesOrder.map((walletAddress: PublicWalletAddress) => {
        const publicAddress = newPublicAddresses.find(
          (pa) =>
            pa.address === walletAddress.address &&
            pa.chainId === walletAddress.chainId
        )
        if (publicAddress) {
          publicAddress.order = orderNumber++
        }
      })

      setPublicWalletAddresses(newPublicAddresses)
      debounceSaveProfile(newPublicAddresses)
    },
    [publicWalletAddresses]
  )

  const walletAddresses = useMemo(() => {
    function isPublic(address: string, chainId: string) {
      return (
        publicWalletAddresses.findIndex(
          (walletAddress) =>
            walletAddress.address === address &&
            walletAddress.chainId === chainId
        ) >= 0
      )
    }

    function getPublicName(address: string, chainId: string) {
      const publicWalletAddress = getPublicWalletAddressObject(address, chainId)
      return publicWalletAddress?.label ?? ''
    }

    let mappedWallets: PublicWalletAddress[] = Object.values(chains).reduce(
      (acc, chain) => {
        const sameChainAdresses = Object.values(wallets).reduce(
          (accAddresses: PublicWalletAddress[], wallet) => {
            const account =
              wallet.accounts[chain.addressMapping as CaipWalletType]
            if (account) {
              const chainId = getChainId(chain.data)
              accAddresses.push({
                address: account.address,
                chainId: chainId,
                label: getPublicName(account.address, chainId),
                order: getPublicAdrressOrder(account.address, chainId),

                // Infered value for displaying
                veridaWalletName: wallet.label,
                isPublic: isPublic(account.address, chainId),
                icon: chain?.icon,
              })
            }

            return accAddresses
          },
          []
        )

        acc.push(...sameChainAdresses)
        return acc
      },
      []
    )

    // Sort array move public addresses to top of the list
    mappedWallets = mappedWallets.sort((a, b) => {
      if (a.isPublic && b.isPublic) {
        return a.order - b.order
      }
      return a.isPublic ? -1 : b.isPublic ? 1 : 0
    })

    return enabledVeridaOne ? mappedWallets : mappedWallets.slice(0, 1) // Shorten the wallet address to one if not enabled Verida One Profile
  }, [
    chains,
    enabledVeridaOne,
    publicWalletAddresses,
    getPublicWalletAddressObject,
    wallets,
    getPublicAdrressOrder,
  ])

  const debounceSaveProfile = useCallback(
    debounce(async (_walletAddresses) => {
      try {
        setQuickFetching(true)
        await VeridaOneManager.setWalletAddresses([..._walletAddresses])
      } catch (e) {
        Sentry.captureException(e)
        Alert.alert('Error', 'Failed to save profile')
        onRefresh()
      } finally {
        setQuickFetching(false)
      }
    }, 1000),
    []
  )

  const fetchData = async () => {
    try {
      setQuickFetching(true)
      const vault = AccountManager.getInstance().vault as any
      const publicData = await vault.profiles.public.getMany()

      setPublicProfile({})

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
    } finally {
      setQuickFetching(false)
    }
  }

  const fetchVeridaOneProfle = async () => {
    // Fetch Verida One Profile
    try {
      const oneProfile = (await VeridaOneManager.getProfile()) as any
      if (oneProfile) {
        setPublicWalletAddresses(oneProfile.walletAddresses)
        setPublicCustomLinks(oneProfile.customLinks)
      }
    } catch (e) {
      Sentry.captureException(e)
      Alert.alert('Error', 'Cannot load Verida profile data')
    }
  }

  useEmitter(
    'SAVE_GENERIC_PROPERTY',
    (payload) => {
      if (payload.screenName !== ScreenName) return
      const mode = payload.mode as EditMode
      if (mode === EditMode.EditWalletPublicLabel) {
        // Save wallet name
        const theWallet = payload.originalValue as PublicWalletAddress
        const publicWallet = getPublicWalletAddressObject(
          theWallet.address,
          theWallet.chainId
        )

        const updatedWallet = {
          ...publicWallet,
          label: (payload.value as string) ?? '',
        }

        const walletIndex = publicWalletAddresses.findIndex(
          (walletAddress) =>
            walletAddress.address === theWallet.address &&
            walletAddress.chainId === theWallet.chainId
        )

        const updatedPublicWalletAddresses = [...publicWalletAddresses]

        if (walletIndex >= 0) {
          // Replace updated item
          updatedPublicWalletAddresses.splice(
            walletIndex,
            1,
            updatedWallet as any
          )
        }

        setPublicWalletAddresses(updatedPublicWalletAddresses)
        debounceSaveProfile(updatedPublicWalletAddresses)
      } else if (mode === EditMode.EnterInvitationCode) {
        const inputCode = payload.value
        if (checkVeridaOneInviteCode(inputCode)) {
          setEnabledVeridaOne(true)
          saveStatusEnabledVeridaOneProfile(true)
        }
      }
    },
    [publicWalletAddresses]
  )

  useEffect(() => {
    setLoading(true)

    // Reset
    setPublicWalletAddresses([])
    setPublicProfile({})

    // Check Verida One enabbled status
    ;(async () => {
      setEnabledVeridaOne(await isEnabledVeridaOneProfile())
    })()

    Promise.all([fetchData(), fetchVeridaOneProfle()]).finally(() => {
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountDID])

  // component did mount
  useEffect(() => {
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

  const renderWalletItem = useCallback(
    ({
      item: walletAddress,
      drag,
      isActive,
    }: RenderItemParams<PublicWalletAddress>) => {
      async function setPublicAddress(
        publicAdress: PublicWalletAddress,
        visible: boolean
      ) {
        const savePublicAddress = { ...publicAdress }

        // Delete item metadata
        delete savePublicAddress.isPublic
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
            (wAddress) =>
              wAddress.address !== publicAdress.address ||
              (wAddress.address === publicAdress.address &&
                wAddress.chainId !== publicAdress.chainId)
          )
          Snackbar.show({
            text: 'Hidden from Verida One profile',
            duration: Snackbar.LENGTH_SHORT,
          })
        }

        setPublicWalletAddresses(newPublicWalletAddresses)
        debounceSaveProfile(newPublicWalletAddresses)
      }

      return (
        <WalletAddressItem
          walletAddress={walletAddress}
          drag={drag}
          isActive={isActive}
          onEditName={
            !walletAddress.isPublic
              ? undefined
              : () => {
                  navigation.navigate('EditGenericProperty', {
                    screenName: ScreenName,
                    title: 'Public Label',
                    option: {
                      label: 'Address public label',
                      type: 'input',
                      value: walletAddress.label,
                      placeholder: 'Enter the label',
                      description:
                        'Address public label is visible to everyone on your Verida One profile. If it’s not set, only the address will be visible.',
                    },
                    mode: EditMode.EditWalletPublicLabel,
                    originalValue: walletAddress,
                  })
                }
          }
          setPublicAddress={setPublicAddress}
        />
      )
    },
    [debounceSaveProfile, navigation, publicWalletAddresses]
  )

  return (
    <Screen
      backgroundGrey
      loadingOverlayColorLight
      withLoadingView
      showLoading={!loading && quickFetching}>
      <NavigationHeader title='Profile' left={{ icon: null } as any} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingView />
        </View>
      ) : (
        <NestableScrollContainer
          contentContainerStyle={{
            padding: theme.spacing.m,
            paddingBottom: enabledVeridaOne ? theme.spacing.xxxl : 0,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <ProfileImageLoader />
          {/** Unavailable - Temporary disabled */}
          {/* <View style={styles.oneProfileLinkContainer}>
            <Image
              style={{
                position: 'absolute',
                width: '100%',
              }}
              resizeMode='stretch'
              source={require('assets/profile_banner_bg.png')}
            />
          </View> */}
          <View style={{ marginTop: theme.spacing.m }}>
            <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
            <PropertyList list={[...editable(list), ...userInfoReadOnlyItem]} />
          </View>
          <Text style={styles.description}>
            This information is always visible on your Verida One page
          </Text>
          <View>
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
                disabled={!enabledVeridaOne}
                onPress={() => navigation.navigate('ManageWallets')}>
                ADD NEW
              </Button>
            </View>

            <NestableDraggableFlatList
              data={walletAddresses}
              renderItem={renderWalletItem}
              activationDistance={60}
              keyExtractor={(
                walletAddress: PublicWalletAddress,
                index: number
              ) => `${index}-${walletAddress.address}`}
              onDragEnd={({ data }) => updateWalletAddressesOrder(data)}
            />
            <Text style={[styles.description, { marginVertical: 0 }]}>
              On your Verida One page we show your wallet addresses with their
              public labels and the assets related to them (collectibles,
              badges, etc)
            </Text>

            {!enabledVeridaOne && (
              <View style={styles.overlayContent}>
                <LinearGradient
                  style={{ ...styles.overlayContent }}
                  colors={['rgba(255, 255, 255, 0.3)', '#FFFFFF', '#FFFFFF']}
                  start={{ y: 0, x: 0.5 }}
                  end={{ y: 0.65, x: 0.5 }}
                />
                <Headline style={{ marginTop: 80, fontSize: 28 }}>
                  Unlock Verida One
                </Headline>
                <Button
                  style={{ width: '100%', marginTop: theme.spacing.sm }}
                  onPress={() => {
                    navigation.navigate('EditGenericProperty', {
                      screenName: ScreenName,
                      title: 'Invitation Code',
                      option: {
                        label: 'Invitation code',
                        type: 'input',
                        value: '',
                        placeholder: 'Enter your code',
                        description: '',
                      },
                      mode: EditMode.EnterInvitationCode,
                      originalValue: null,
                      submitButtonLabel: 'Submit',
                      verification: {
                        expectedValue: VERIDA_ONE_INVITE_CODE,
                        errorMessage: 'Wrong code, please try again later.',
                      },
                    })
                  }}>
                  Enter Invitation Code
                </Button>
              </View>
            )}
          </View>
        </NestableScrollContainer>
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
      color: theme.color.textLightGrey,
    },
    overlayContent: {
      ...StyleSheet.absoluteFillObject,
      marginHorizontal: -theme.spacing.m,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
      minHeight: 260,
      maxHeight: 260,
    },
  })
