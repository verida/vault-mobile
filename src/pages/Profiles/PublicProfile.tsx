import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import { editable, isEnabledVeridaOneProfile } from 'helpers/profile'
import { debounce, isEqual } from 'lodash'
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Alert,
  Dimensions,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
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

import AccountManager from 'api/AccountManager'
import DataConnectorsManager from 'api/DataConnectorsManager'
import {
  BlockchainNetwork,
  BlockchainWalletWithAccounts,
  VeridaOneCustomLink,
  VeridaOneFeaturedAsset,
  VeridaOnePlatformLink,
  VeridaOnePlatformLinkCategory,
  VeridaOneWalletAddress,
} from 'api/types'
import UsernameManager from 'api/UsernameManager'
import VeridaOneManager from 'api/VeridaOneManager'
import Button from 'components/Button'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import ProfileImageLoader from 'components/ProfileImageLoader'
import PropertyList from 'components/PropertyList'
import {
  CustomLinkItem,
  FeaturedAssetItem,
  ProfileUsernameSection,
  WalletAddressItem,
} from 'components/PublicProfile'
import { PlatformLinkItem } from 'components/PublicProfile/PlatformLinkItem'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import { Headline } from 'components/Typography/Headline'
import { Text } from 'components/Typography/Text'
import { PLATFORM_LINKS } from 'constants/profile'
import { useEmitter } from 'hooks/useEmitter'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { setPublicProfileData } from 'reduxStore/general/actions'
import { getBlockchainNetworks } from 'reduxStore/selectors'
import { allWalletsSelector } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

export enum PublicProfileEditMode {
  EditWalletPublicLabel,
  AddCustomURL,
  DeleteCustomURL,
  SelectFeaturedAsset,
  AddPlatformLink,
}

const SCREEN_NAME = 'PublicProfile'
const MAX_NUMBER_OF_FEATURED_CUSTOM_LINK = 2
const NUMBER_FEATURED_ASSETS = 4

const EMPTY_PROFILE_EDITABLE_PROPS = [
  { label: 'Name', value: '', action: 'arrow', type: 'input' },
  { label: 'Country', value: '', action: 'arrow', type: 'select' },
  { label: 'Description', value: '', action: 'arrow', type: 'textarea' },
]
const EMPTY_PROFILE_READONLY_PROPS = [
  { label: 'DID', value: '', action: 'copy' },
]

const PublicProfile = ({ updatePublicProfileData }: any) => {
  const [profileEditableProps, setProfileEditableProps] = useState(
    EMPTY_PROFILE_EDITABLE_PROPS
  )
  const [profileReadonlyProps, setProfileReadonlyProps] = useState(
    EMPTY_PROFILE_READONLY_PROPS
  )

  const { theme } = useTheme()
  const navigation = useNavigation()
  const { showActionSheetWithOptions } = useActionSheet()
  const [loading, setLoading] = useState(true)
  const [quickFetching, setQuickFetching] = useState(false) // Manage a lighter loading indicator for a better UX
  const [veridaOneProfile, setVeridaOneProfile] = useState<any>({})
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    BlockchainWalletWithAccounts
  >

  const selectedAccount = useSelector(
    (state: any) => state.main.selectedAccount
  )
  const currentAccountDID =
    selectedAccount?.did ??
    AccountManager.getInstance().getSelectedAccount()?.did

  const [username, setUsername] = useState<string | undefined>(undefined)
  const blockchainNetworks = useSelector(getBlockchainNetworks) as Record<
    string,
    BlockchainNetwork
  >
  const styles = useThemeAwareStyle(createStyles)
  const [publicWalletAddresses, setPublicWalletAddresses] = useState<
    VeridaOneWalletAddress[]
  >([])

  const [platformLinks, setPlatformLinks] = useState<any[]>([])
  const [supportedConnectPlatforms, setSupportedConnectPlatforms] = useState<
    any[]
  >([])

  const [publicCustomLinks, setPublicCustomLinks] = useState<any[]>([])
  const [featuredAssets, setFeaturedAssets] = useState<any[]>([])

  const [enabledVeridaOne, setEnabledVeridaOne] = useState(false)

  // pull to refresh data
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    Promise.all([fetchData(), fetchVeridaOneProfle(), fetchUsername()]).finally(
      () => {
        setRefreshing(false)
      }
    )
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

  const getPublicAddressOrder = useCallback(
    (address: string, chainId: string) => {
      const publicWalletAddress = getPublicWalletAddressObject(address, chainId)
      return publicWalletAddress?.order ?? 0
    },
    [getPublicWalletAddressObject]
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

    function getPublicName(
      address: string,
      blockchainNetwork: BlockchainNetwork
    ) {
      const publicWalletAddress = getPublicWalletAddressObject(
        address,
        blockchainNetwork.chainId
      )
      return publicWalletAddress?.label ?? ''
    }

    let mappedWallets: VeridaOneWalletAddress[] = Object.values(
      blockchainNetworks
    ).reduce(
      (acc: VeridaOneWalletAddress[], blockchainNetwork: BlockchainNetwork) => {
        const sameChainAdresses = Object.values(wallets).reduce(
          (
            accAddresses: VeridaOneWalletAddress[],
            wallet: BlockchainWalletWithAccounts
          ) => {
            const account = wallet.accounts[blockchainNetwork.chainId]
            if (account) {
              accAddresses.push({
                address: account.address!,
                chainId: blockchainNetwork.chainId,
                label: getPublicName(account.address!, blockchainNetwork),
                order: getPublicAddressOrder(
                  account.address!,
                  blockchainNetwork.chainId
                ),

                // Infered value for displaying
                veridaWalletName: wallet.label,
                isPublic: isPublic(account.address!, blockchainNetwork.chainId),
                icon: blockchainNetwork.icon,
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
    blockchainNetworks,
    enabledVeridaOne,
    publicWalletAddresses,
    getPublicWalletAddressObject,
    wallets,
    getPublicAddressOrder,
  ])

  // Platform links
  const allPlatformLinks: VeridaOnePlatformLink[] = useMemo(() => {
    // TODO: rework around the data from connectable platforms
    // The current shape of data of a connectable platform: missing accountId and URL
    // {
    //   "icon": 1,
    //   "label": "Facebook",
    //   "name": "facebook",
    //   "syncStatus": "disabled"
    // },
    const connectedPlaforms =
      supportedConnectPlatforms
        .filter((platform) => platform.syncStatus !== 'disabled')
        .map((item) => ({ ...item, platform: item.platform || item.name })) ??
      []

    const combinedListPlatforms = [
      ...connectedPlaforms.filter(
        (connectedPlatform) =>
          !platformLinks.some(
            (item) => item.platform === connectedPlatform.name
          )
      ),
      ...platformLinks,
    ].map((platform) => ({
      ...platform,
      platform: platform.platform || platform.name,

      // Infered value for displaying
      connectedPlatform: connectedPlaforms.some(
        (item) => item.platform === platform.platform
      ),
      showOnVeridaOne: platformLinks.some((item) => item.url === platform.url),
    }))
    const sortedListPlatforms = combinedListPlatforms.sort((a, b) => {
      if (a.showOnVeridaOne && b.showOnVeridaOne) {
        return a.order - b.order
      }
      return a.showOnVeridaOne ? -1 : b.showOnVeridaOne ? 1 : 0
    })

    return sortedListPlatforms
  }, [platformLinks, supportedConnectPlatforms])

  const debounceSaveProfile = useCallback(
    debounce(async (updatedProfile) => {
      const { walletAddresses, customLinks, featuredAssets, platformLinks } =
        updatedProfile
      try {
        setQuickFetching(true)
        if (
          'walletAddresses' in updatedProfile &&
          !isEqual(veridaOneProfile.walletAddresses, walletAddresses)
        ) {
          await VeridaOneManager.setWalletAddresses(walletAddresses)
        }

        if (
          'customLinks' in updatedProfile &&
          !isEqual(veridaOneProfile.customLinks, customLinks)
        ) {
          await VeridaOneManager.setCustomLinks(customLinks)
        }

        if (
          'featuredAssets' in updatedProfile &&
          !isEqual(veridaOneProfile.featuredAssets, featuredAssets)
        ) {
          await VeridaOneManager.setFeaturedAssets(featuredAssets)
        }

        if (
          'platformLinks' in updatedProfile &&
          !isEqual(veridaOneProfile.platformLinks, platformLinks)
        ) {
          await VeridaOneManager.setPlatformLinks(platformLinks)
        }

        // refetch profile so react state correctly updates
        fetchVeridaOneProfle()
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

  const updateWalletAddressesOrder = useCallback(
    (walletAddressesOrder) => {
      let orderNumber = 0

      const newPublicAddresses = [...publicWalletAddresses]
      walletAddressesOrder.map((walletAddress: VeridaOneWalletAddress) => {
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
      debounceSaveProfile({ walletAddresses: newPublicAddresses })
    },
    [publicWalletAddresses, debounceSaveProfile]
  )

  const updatePlatformLinksOrder = useCallback(
    (updatedOderPlatformLinks) => {
      let orderNumber = 0

      const updatedPlatformLinks = [...platformLinks]
      updatedOderPlatformLinks.map((plaformLink: VeridaOnePlatformLink) => {
        const pl = updatedPlatformLinks.find(
          (item) => item.url === plaformLink.url
        )
        if (pl) {
          pl.order = orderNumber++
        }
      })

      setPlatformLinks(updatedPlatformLinks)
      debounceSaveProfile({ platformLinks: updatedPlatformLinks })
    },
    [platformLinks, debounceSaveProfile]
  )

  const updateCustomLinksOrder = useCallback(
    (customLinksNewOrder) => {
      let orderNumber = 0

      const newCustomLinks = customLinksNewOrder.map(
        (link: VeridaOneCustomLink) => {
          link.order = orderNumber++
          return link
        }
      )

      setPublicCustomLinks(newCustomLinks)
      debounceSaveProfile({ customLinks: newCustomLinks })
    },
    [debounceSaveProfile]
  )

  const setFeaturedCustomLink = useCallback(
    (customLink: VeridaOneCustomLink, featured: boolean) => {
      const totalNumberFeaturedLink = publicCustomLinks.reduce(
        (acc, cur: VeridaOneCustomLink) => acc + (cur.featured ? 1 : 0),
        0
      )

      if (
        !customLink.featured &&
        featured &&
        totalNumberFeaturedLink >= MAX_NUMBER_OF_FEATURED_CUSTOM_LINK
      ) {
        Snackbar.show({
          text: 'You already have two featured links',
          duration: Snackbar.LENGTH_SHORT,
        })
        return
      }

      const updatedCustomLinks = [...publicCustomLinks]
      const linkIndex = updatedCustomLinks.findIndex(
        (link) => link.url === customLink.url && link.label === customLink.label
      )

      if (linkIndex >= 0) {
        const updateLink = {
          ...customLink,
          featured,
        }

        // Replace updated item
        updatedCustomLinks.splice(linkIndex, 1, updateLink as any)

        setPublicCustomLinks(updatedCustomLinks)
        debounceSaveProfile({ customLinks: updatedCustomLinks })
      }
    },
    [debounceSaveProfile, publicCustomLinks]
  )

  const fetchData = async () => {
    try {
      setQuickFetching(true)
      const vault = AccountManager.getInstance().vault as any
      const publicData = await vault.profiles.public.getMany()

      updatePublicProfileData(publicData)
      const updatedList = profileEditableProps.map((item: any) => {
        const label = item.label.toLowerCase()
        item.value = publicData[label] ?? undefined
        return item
      })

      setProfileEditableProps(updatedList)
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
        setVeridaOneProfile(oneProfile)
        setPublicWalletAddresses([...oneProfile.walletAddresses])
        setPublicCustomLinks([...oneProfile.customLinks])
        setPlatformLinks([...oneProfile.platformLinks])

        // Update items order
        const updatedFeaturedAssets = oneProfile.featuredAssets.map(
          (asset: VeridaOneFeaturedAsset, idx: number) => ({
            ...asset,
            order: idx,
          })
        )
        setFeaturedAssets(updatedFeaturedAssets)
      }
    } catch (e) {
      Sentry.captureException(e)
      Alert.alert('Error', 'Cannot load Verida profile data')
    }
  }

  const fetchUsername = async () => {
    try {
      const accountUsernames = await UsernameManager.get()
      if (accountUsernames && accountUsernames?.length > 0) {
        setUsername(accountUsernames[0])
        setProfileReadonlyProps((currentValues) => {
          const updateValues = [...currentValues]
          const newItem = {
            label: 'Username',
            value: accountUsernames[0],
            action: 'copy',
          }
          const index = currentValues.findIndex(
            (item) => item.label === 'Username'
          )

          if (index !== -1) {
            updateValues.splice(index, 1, newItem)
          } else {
            updateValues.push(newItem)
          }

          return updateValues
        })
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  const removeFeaturedAsset = useCallback(
    (index, featuredAsset: VeridaOneFeaturedAsset) => {
      let updatedFeaturedAssets = [...featuredAssets]
      const itemIndex = featuredAssets.findIndex(
        (it) =>
          featuredAsset.chainId === it.chainId &&
          featuredAsset.tokenId === it.tokenId &&
          featuredAsset.order === it.order
      )

      if (itemIndex >= 0) {
        updatedFeaturedAssets.splice(itemIndex, 1)
        // Update items order
        updatedFeaturedAssets = updatedFeaturedAssets.map((asset, idx) => ({
          ...asset,
          order: idx,
        }))

        setFeaturedAssets(updatedFeaturedAssets)
        debounceSaveProfile({ featuredAssets: updatedFeaturedAssets })
        Snackbar.show({
          text: 'Removed',
          duration: Snackbar.LENGTH_SHORT,
        })
      }
    },
    [debounceSaveProfile, featuredAssets]
  )

  useEmitter('UPDATE_PROFILE_USERNAME', () => {
    setLoading(true)
    fetchUsername().finally(() => {
      setLoading(false)
    })
  })

  useEmitter('UNLOCK_VERIDA_ONE', () => {
    setEnabledVeridaOne(true)
  })

  useEmitter(
    'SAVE_GENERIC_PROPERTY',
    (payload) => {
      if (payload.screenName !== SCREEN_NAME) return
      const mode = payload.mode as PublicProfileEditMode
      if (mode === PublicProfileEditMode.EditWalletPublicLabel) {
        // Save wallet name
        const theWallet = payload.originalValue as VeridaOneWalletAddress
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
        debounceSaveProfile({ walletAddresses: updatedPublicWalletAddresses })
      } else if (mode === PublicProfileEditMode.AddCustomURL) {
        const inputValue = payload.value
        const originalValue = payload.originalValue
        const updatedCustomLinks = [...publicCustomLinks]

        const inputLink = {
          ...originalValue,
          label: inputValue.label,
          url: inputValue.url,
        }
        if (originalValue) {
          // edit mode
          const linkIndex = updatedCustomLinks.findIndex(
            (link) =>
              link.url === originalValue.url &&
              link.label === originalValue.label
          )

          if (linkIndex >= 0) {
            // Replace updated item
            updatedCustomLinks.splice(linkIndex, 1, inputLink as any)
          }
        } else {
          // new mode
          inputLink.order = publicCustomLinks.length // add a new link and put it bottom
          updatedCustomLinks.push(inputLink)
        }

        setPublicCustomLinks(updatedCustomLinks)
        debounceSaveProfile({ customLinks: updatedCustomLinks })
      } else if (mode === PublicProfileEditMode.DeleteCustomURL) {
        const originalValue = payload.originalValue
        const updatedCustomLinks = publicCustomLinks.filter(
          (customLink) =>
            customLink.url !== originalValue.url &&
            customLink.label !== originalValue.label
        )
        setPublicCustomLinks(updatedCustomLinks)
        debounceSaveProfile({ customLinks: updatedCustomLinks })
        Snackbar.show({
          text: 'Link deleted',
          duration: Snackbar.LENGTH_SHORT,
        })
      } else if (mode === PublicProfileEditMode.SelectFeaturedAsset) {
        const inputValue = payload.value
        const originalValue = payload.originalValue
        const updatedFeaturedAssets = [...featuredAssets]
        const newAsset = inputValue

        // edit mode
        const assetIndex = updatedFeaturedAssets.findIndex(
          (asset) => asset.order === originalValue.order
        )

        if (assetIndex >= 0) {
          // Replace updated item
          updatedFeaturedAssets.splice(assetIndex, 1, newAsset)
        } else {
          updatedFeaturedAssets.push(newAsset)
        }

        setFeaturedAssets(updatedFeaturedAssets)
        debounceSaveProfile({ featuredAssets: updatedFeaturedAssets })
      } else if (mode === PublicProfileEditMode.AddPlatformLink) {
        const inputValue = payload.value
        const originalValue = payload.originalValue
        const updatedPlatformLinks = [...platformLinks]

        const platformLink = {
          ...originalValue,
          ...inputValue,
        }

        if (originalValue) {
          // edit mode
          const linkIndex = updatedPlatformLinks.findIndex(
            (link) => link.url === originalValue.url
          )

          if (linkIndex >= 0) {
            // Replace updated item
            updatedPlatformLinks.splice(linkIndex, 1, platformLink as any)
          }
        } else {
          // new mode
          platformLink.order = publicCustomLinks.length // add a new link and put it bottom
          updatedPlatformLinks.push(platformLink)
        }

        setPlatformLinks(updatedPlatformLinks)
        debounceSaveProfile({ platformLinks: updatedPlatformLinks })
      }
    },
    [publicWalletAddresses]
  )

  useEffect(() => {
    // A little bit of delay here to avoid any unclean state when switching accounts
    const tid = setTimeout(() => {
      setLoading(true)

      setProfileReadonlyProps([
        { label: 'DID', value: currentAccountDID, action: 'copy' },
      ])

      // Reset
      setProfileEditableProps(EMPTY_PROFILE_EDITABLE_PROPS)
      setVeridaOneProfile({})

      setPublicWalletAddresses([])
      setPlatformLinks([])
      setFeaturedAssets([])
      setPublicCustomLinks([])
      setUsername(undefined)

      // Check Verida One enabbled status
      ;(async () => {
        setEnabledVeridaOne(await isEnabledVeridaOneProfile())
      })()

      Promise.all([
        fetchData(),
        fetchVeridaOneProfle(),
        fetchUsername(),
      ]).finally(() => {
        setLoading(false)
      })
    }, 200)

    return () => {
      clearTimeout(tid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountDID])

  useEffect(() => {
    function buildConnections(allConnectors: any) {
      const finalConnectors = []
      for (const connectorName in allConnectors) {
        finalConnectors.push(allConnectors[connectorName].render())
      }

      return finalConnectors
    }

    const fetchPlatformConnections = async () => {
      try {
        setLoading(true)
        DataConnectorsManager.triggerSync()

        const currentConnectors = await DataConnectorsManager.getConnectors()
        setSupportedConnectPlatforms(buildConnections(currentConnectors))
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    fetchPlatformConnections()

    const onConnectionUpdated = async () => {
      // Connection has been updated, so update UI
      const conns = await DataConnectorsManager.getConnectors()
      setSupportedConnectPlatforms(buildConnections(conns))
    }
    DataConnectorsManager.on('connectionUpdated', onConnectionUpdated)
    const onLogout = async () => {
      await DataConnectorsManager.resetConnector()
    }
    DataConnectorsManager.on('logout', onLogout)
    return () => {
      DataConnectorsManager.off('connectionUpdated', onConnectionUpdated)
      DataConnectorsManager.off('logout', onLogout)
    }
  }, [])

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
    }: RenderItemParams<VeridaOneWalletAddress>) => {
      async function setPublicAddress(
        publicAdress: VeridaOneWalletAddress,
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
          savePublicAddress.order = newPublicWalletAddresses.length - 1
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
        debounceSaveProfile({ walletAddresses: newPublicWalletAddresses })
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
                    screenName: SCREEN_NAME,
                    title: 'Public Label',
                    option: {
                      label: 'Address public label',
                      type: 'input',
                      value: walletAddress.label,
                      placeholder: 'Enter the label',
                      description:
                        'Address public label is visible to everyone on your Verida One profile. If it’s not set, only the address will be visible.',
                    },
                    mode: PublicProfileEditMode.EditWalletPublicLabel,
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

  const renderPlatformLinkItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<VeridaOnePlatformLink>) => {
      async function setShowOnVeridaOne(
        platformLink: VeridaOnePlatformLink,
        show: boolean
      ) {
        const updatedPlatformLink: VeridaOnePlatformLink = {
          platform: platformLink.platform,
          category: VeridaOnePlatformLinkCategory.SOCIAL,
          accountId: '',
          url: platformLink.url || platformLink.platform,
          order: platformLink.order,
        }
        let updatedPlatformLinks = [...platformLinks]
        if (show) {
          updatedPlatformLinks.push(updatedPlatformLink)
          updatedPlatformLink.order = updatedPlatformLinks.length - 1
          Snackbar.show({
            text: 'Added to Verida One profile',
            duration: Snackbar.LENGTH_SHORT,
          })
        } else {
          updatedPlatformLinks = updatedPlatformLinks.filter(
            (link) => link.url !== platformLink.url
          )

          Snackbar.show({
            text: 'Hidden from Verida One profile',
            duration: Snackbar.LENGTH_SHORT,
          })
        }
        setPlatformLinks(updatedPlatformLinks)
        debounceSaveProfile({ platformLinks: updatedPlatformLinks })
      }

      return (
        <PlatformLinkItem
          platformLink={item}
          setShowOnVeridaOne={setShowOnVeridaOne}
          drag={drag}
          isActive={isActive}
          onEditPlatformInfo={() => {
            navigation.navigate('EditPlatformLink', {
              screenName: SCREEN_NAME,
              mode: PublicProfileEditMode.AddPlatformLink,
              platform: item.platform,
              selectedPlatform: PLATFORM_LINKS[item.platform],
              originalValue: item,
            })
          }}
        />
      )
    },
    [debounceSaveProfile, navigation, platformLinks]
  )

  const renderCustomLinkItem = useCallback(
    ({ item: link, drag, isActive }: RenderItemParams<VeridaOneCustomLink>) => {
      return (
        <CustomLinkItem
          customLink={link}
          drag={drag}
          isActive={isActive}
          onEdit={() => {
            navigation.navigate('AddCustomLink', {
              screenName: SCREEN_NAME,
              title: 'Public Label',
              label: link.label,
              url: link.url,
              mode: PublicProfileEditMode.AddCustomURL,
              originalValue: link,
            })
          }}
          setFeatured={setFeaturedCustomLink}
        />
      )
    },
    [navigation, setFeaturedCustomLink]
  )

  const renderFeatureAsssetItem = useCallback(
    ({
      item: featuredAsset,
      index,
    }: {
      item?: VeridaOneFeaturedAsset
      index: number
    }) => {
      return (
        <Fragment key={`featured-asset-${index}`}>
          <FeaturedAssetItem
            featuredAsset={featuredAsset}
            index={index}
            lastItemIndex={featuredAssets.length - 1}
            onEdit={() => {
              if (featuredAsset) {
                const options = ['Replace', 'Remove', 'Cancel']
                const cancelButtonIndex = 2

                showActionSheetWithOptions(
                  {
                    options,
                    cancelButtonIndex,
                  },
                  (selectedIndex?: number) => {
                    switch (selectedIndex!) {
                      case 0:
                        navigation.navigate('SelectAsset', {
                          screenName: SCREEN_NAME,
                          mode: PublicProfileEditMode.SelectFeaturedAsset,
                          originalValue: {
                            order: index,
                          },
                          searchableAddresses: publicWalletAddresses.map(
                            (address) => address.address
                          ),
                        })
                        break

                      case 1:
                        removeFeaturedAsset(index, featuredAsset)
                        break

                      case cancelButtonIndex:
                        // Canceled
                        break
                    }
                  }
                )
              } else {
                navigation.navigate('SelectAsset', {
                  screenName: SCREEN_NAME,
                  mode: PublicProfileEditMode.SelectFeaturedAsset,
                  originalValue: {
                    order: index,
                  },
                  searchableAddresses: publicWalletAddresses.map(
                    (item) => `${item.chainId}:${item.address}`
                  ),
                })
              }
            }}
          />
          <Spacer horizontal='s' />
        </Fragment>
      )
    },
    [
      featuredAssets,
      navigation,
      publicWalletAddresses,
      removeFeaturedAsset,
      showActionSheetWithOptions,
    ]
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
            paddingBottom: 0,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <ProfileImageLoader />
          {enabledVeridaOne && (
            <ProfileUsernameSection
              did={currentAccountDID}
              username={username}
              loading={loading || quickFetching}
            />
          )}
          <View style={{ marginTop: theme.spacing.m }}>
            <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
            <PropertyList
              list={[
                ...editable(profileEditableProps),
                ...profileReadonlyProps,
              ]}
            />
          </View>
          <Text style={styles.description}>
            This information is always visible on your Verida One page
          </Text>
          <View>
            {/* Wallet address */}
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
              scrollEnabled={false}
              keyExtractor={(
                walletAddress: VeridaOneWalletAddress,
                index: number
              ) => `${index}-${walletAddress.address}`}
              onDragEnd={({ data }) => updateWalletAddressesOrder(data)}
            />
            <Text style={[styles.description, { marginVertical: 0 }]}>
              On your Verida One page we show your wallet addresses with their
              public labels and the assets related to them (collectibles,
              badges, etc)
            </Text>

            {/* Social Megia */}
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={styles.sectionHeader}>SOCIAL MEDIA</Text>
              <Button
                textStyle={{
                  fontSize: theme.fontSize.m,
                  marginBottom: theme.spacing.s,
                }}
                color='transparent-link'
                disabled={!enabledVeridaOne}
                onPress={() =>
                  navigation.navigate('AddPlatformLink', {
                    screenName: SCREEN_NAME,
                    mode: PublicProfileEditMode.AddPlatformLink,
                    supportedConnectPlatforms,
                    availablePlatformLinks: Object.values(
                      PLATFORM_LINKS
                    ).filter(
                      (network) =>
                        !supportedConnectPlatforms.some(
                          (cn) =>
                            cn.name === network.name &&
                            cn.syncStatus !== 'disabled'
                        )
                    ),
                  })
                }>
                ADD NEW
              </Button>
            </View>

            <NestableDraggableFlatList
              data={allPlatformLinks}
              renderItem={renderPlatformLinkItem}
              activationDistance={60}
              scrollEnabled={false}
              keyExtractor={(
                platformLink: VeridaOnePlatformLink,
                index: number
              ) => `${index}-${platformLink.url}`}
              onDragEnd={({ data }) => updatePlatformLinksOrder(data)}
            />
            <Text style={[styles.description, { marginVertical: 0 }]}>
              Connect your social media accounts and select which of them you
              want to showcase on your Veria One profile
            </Text>

            {enabledVeridaOne ? (
              <>
                {/* Featured assets */}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.sectionHeader}>FEATURED ASSETS</Text>
                </View>
                <ScrollView
                  style={{ marginHorizontal: -theme.spacing.m }}
                  contentContainerStyle={{ paddingHorizontal: theme.spacing.m }}
                  showsHorizontalScrollIndicator={false}
                  horizontal>
                  {Array(NUMBER_FEATURED_ASSETS)
                    .fill(1)
                    .map((_, index) => {
                      const assetItem = featuredAssets.find(
                        (it) => it.order === index
                      )
                      return renderFeatureAsssetItem({ item: assetItem, index })
                    })}
                </ScrollView>
                <Text style={[styles.description]}>
                  Select up to 4 assets from your selected wallets you’d like to
                  show in the featured area of your Verida One profile
                </Text>

                {/* Custom links */}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.sectionHeader}>LINKS</Text>
                  <Button
                    textStyle={{
                      fontSize: theme.fontSize.m,
                      marginBottom: theme.spacing.s,
                    }}
                    color='transparent-link'
                    disabled={!enabledVeridaOne}
                    onPress={() =>
                      navigation.navigate('AddCustomLink', {
                        screenName: SCREEN_NAME,
                        mode: PublicProfileEditMode.AddCustomURL,
                        title: 'Add Custom Link',
                      })
                    }>
                    ADD NEW
                  </Button>
                </View>
                <NestableDraggableFlatList
                  data={publicCustomLinks}
                  renderItem={renderCustomLinkItem}
                  activationDistance={30}
                  scrollEnabled={false}
                  keyExtractor={(item: VeridaOneCustomLink, index: number) =>
                    `${index}-${item.url}`
                  }
                  onDragEnd={({ data }) => updateCustomLinksOrder(data)} // TODO: save it
                />
                <Text style={[styles.description, { marginVertical: 0 }]}>
                  Add any links you’d like to show on your page. It could be a
                  link to your website, portfolio etc. Tap on the star to add up
                  to two links to the featured section.
                </Text>
              </>
            ) : null}

            {!enabledVeridaOne && (
              <>
                {
                  // In case the wallet address is still creating and not available we add a buffer space
                  walletAddresses.length === 0 && (
                    <View style={{ minHeight: 120 }} />
                  )
                }
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
                      navigation.navigate('UnlockVeridaOne', {})
                    }}>
                    Enter Invitation Code
                  </Button>
                </View>
              </>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: Dimensions.get('window').height * 0.8,
    },
    overlayContent: {
      ...StyleSheet.absoluteFillObject,
      marginHorizontal: -theme.spacing.m,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
    },
  })
