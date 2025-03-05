import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, RefreshControl, StyleSheet, View } from 'react-native'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { useSelector } from 'react-redux'

import AccountManager from '~/api/AccountManager'
import UsernameManager from '~/api/UsernameManager'
import { AvatarUploader } from '~/components'
import LoadingView from '~/components/LoadingView'
import { PropertyList } from '~/components/PropertyList'
import Screen from '~/components/Screen'
import { Text } from '~/components/Typography/Text'
import { useTheme } from '~/contexts/ThemeContext'
import { selectSelectedAccount } from '~/features/identities'
import {
  PublicProfile as IPublicProfile,
  selectSelectedPublicProfile,
  setPublicProfileByDid,
} from '~/features/profiles'
import { Logger } from '~/features/telemetry'
// import { VeridaOneManager, VeridaOneProfile } from '~/features/veridaOne'
import { useEmitter } from '~/hooks/useEmitter'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { MainStackScreenProps } from '~/navigation/types'
import { EditProfilePropertyOption } from '~/pages/Profiles/EditProfileScreen'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

// TODO: We absolutely have to refactor and breakdown this page!

const logger = Logger.create('Pages/Profiles/PublicProfile')

export enum PublicProfileEditMode {
  EditWalletPublicLabel,
  AddCustomURL,
  DeleteCustomURL,
  SelectFeaturedAsset,
  AddPlatformLink,
  DeletePlatformURL,
}

// const SCREEN_NAME = 'PublicProfile'

const EMPTY_PROFILE_EDITABLE_PROPS: EditProfilePropertyOption[] = [
  { label: 'Name', key: 'name', value: '', action: 'arrow', type: 'input' },
  {
    label: 'Country',
    key: 'country',
    value: '',
    action: 'arrow',
    type: 'select',
  },
  {
    label: 'Description',
    key: 'description',
    value: '',
    action: 'arrow',
    type: 'textarea',
  },
  {
    label: 'Website',
    key: 'website',
    value: '',
    action: 'arrow',
    type: 'input',
  },
]

const EMPTY_PROFILE_READONLY_PROPS = [
  { label: 'DID', value: '', action: 'copy' },
]

export type PublicProfileScreenParams = undefined

type PublicProfileScreenProps = MainStackScreenProps<'PublicProfile'>

export const PublicProfileScreen: React.FC<PublicProfileScreenProps> = (
  props
) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Profile',
    })
  }, [navigation])

  const publicProfileData = useAppSelector(selectSelectedPublicProfile)
  const profileEditableProps = useMemo(() => {
    return EMPTY_PROFILE_EDITABLE_PROPS.map((item) => {
      return {
        ...item,
        value: (publicProfileData[item.key as keyof IPublicProfile] ??
          '') as string, // HACK: EditProfilePropertyOption doesn't like the type of avatar, but as we don't use it in the list, the value should not be of this type
      }
    })
  }, [publicProfileData])
  const [profileReadonlyProps, setProfileReadonlyProps] = useState(
    EMPTY_PROFILE_READONLY_PROPS
  )

  const { theme } = useTheme()

  const [loading, setLoading] = useState<boolean>(false)
  const [quickFetching, setQuickFetching] = useState<boolean>(false) // Manage a lighter loading indicator for a better UX

  const selectedAccount = useSelector(selectSelectedAccount)!
  const currentAccountDID = selectedAccount?.did

  const dispatch = useAppDispatch()

  const [username, setUsername] = useState<string | undefined>(undefined)
  const styles = useThemeAwareStyle(createStyles)

  // pull to refresh data
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([
      fetchPublicProfile(),
      // fetchVeridaOneProfle(),
      fetchUsername(),
    ]).finally(() => {
      setRefreshing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const debounceSaveProfile = useDebouncedCallback(
  //   React.useCallback(
  //     async (updatedProfile: Partial<VeridaOneProfile>) => {
  //       const { walletAddresses, customLinks, featuredAssets, platformLinks } =
  //         updatedProfile
  //       try {
  //         setQuickFetching(true)
  //         if (
  //           'walletAddresses' in updatedProfile &&
  //           !isEqual(veridaOneProfile.walletAddresses, walletAddresses)
  //         ) {
  //           await VeridaOneManager.setWalletAddresses(walletAddresses || [])
  //         }

  //         if (
  //           'customLinks' in updatedProfile &&
  //           !isEqual(veridaOneProfile.customLinks, customLinks)
  //         ) {
  //           await VeridaOneManager.setCustomLinks(customLinks || [])
  //         }

  //         if (
  //           'featuredAssets' in updatedProfile &&
  //           !isEqual(veridaOneProfile.featuredAssets, featuredAssets)
  //         ) {
  //           await VeridaOneManager.setFeaturedAssets(featuredAssets || [])
  //         }

  //         if (
  //           'platformLinks' in updatedProfile &&
  //           !isEqual(veridaOneProfile.platformLinks, platformLinks)
  //         ) {
  //           await VeridaOneManager.setPlatformLinks(platformLinks || [])
  //         }

  //         // refetch profile so react state correctly updates
  //         fetchVeridaOneProfle()
  //       } catch (error) {
  //         logger.error(error)
  //         Alert.alert('Error', 'Failed to save profile')
  //         onRefresh()
  //       } finally {
  //         setQuickFetching(false)
  //       }
  //     },
  //     [
  //       onRefresh,
  //       veridaOneProfile.customLinks,
  //       veridaOneProfile.featuredAssets,
  //       veridaOneProfile.platformLinks,
  //       veridaOneProfile.walletAddresses,
  //     ]
  //   ),
  //   1000
  // )

  // const updateWalletAddressesOrder = useCallback(
  //   (walletAddressesOrder: VeridaOneWalletAddress[]) => {
  //     let orderNumber = 0

  //     const newPublicAddresses = [...publicWalletAddresses]
  //     walletAddressesOrder.forEach((walletAddress: VeridaOneWalletAddress) => {
  //       const publicAddress = newPublicAddresses.find(
  //         (pa) =>
  //           pa.address === walletAddress.address &&
  //           pa.chainId === walletAddress.chainId
  //       )
  //       if (publicAddress) {
  //         publicAddress.order = orderNumber++
  //       }
  //     })

  //     setPublicWalletAddresses(newPublicAddresses)
  //     debounceSaveProfile({ walletAddresses: newPublicAddresses })
  //   },
  //   [publicWalletAddresses, debounceSaveProfile]
  // )

  // const updatePlatformLinksOrder = useCallback(
  //   (updatedOderPlatformLinks: VeridaOnePlatformLink[]) => {
  //     let orderNumber = 0

  //     const updatedPlatformLinks = [...platformLinks]
  //     updatedOderPlatformLinks.map((plaformLink: VeridaOnePlatformLink) => {
  //       const pl = updatedPlatformLinks.find(
  //         (item) => item.url === plaformLink.url
  //       )
  //       if (pl) {
  //         pl.order = orderNumber++
  //       }
  //     })

  //     setPlatformLinks(updatedPlatformLinks)
  //     debounceSaveProfile({ platformLinks: updatedPlatformLinks })
  //   },
  //   [platformLinks, debounceSaveProfile]
  // )

  // const updateCustomLinksOrder = useCallback(
  //   (customLinksWithNewOrder: VeridaOneCustomLink[]) => {
  //     let orderNumber = 0

  //     const newCustomLinks = customLinksWithNewOrder.map(
  //       (link: VeridaOneCustomLink) => {
  //         link.order = orderNumber++
  //         return link
  //       }
  //     )

  //     setPublicCustomLinks(newCustomLinks)
  //     debounceSaveProfile({ customLinks: newCustomLinks })
  //   },
  //   [debounceSaveProfile]
  // )

  // const setFeaturedCustomLink = useCallback(
  //   (customLink: VeridaOneCustomLink, featured: boolean) => {
  //     const totalNumberFeaturedLink = publicCustomLinks.reduce(
  //       (acc, cur: VeridaOneCustomLink) => acc + (cur.featured ? 1 : 0),
  //       0
  //     )

  //     if (
  //       !customLink.featured &&
  //       featured &&
  //       totalNumberFeaturedLink >= VERIDA_ONE_MAX_FEATURED_CUSTOM_LINKS
  //     ) {
  //       Snackbar.show({
  //         text: 'You already have two featured links',
  //         duration: Snackbar.LENGTH_SHORT,
  //       })
  //       return
  //     }

  //     const updatedCustomLinks = [...publicCustomLinks]
  //     const linkIndex = updatedCustomLinks.findIndex(
  //       (link) => link.url === customLink.url && link.label === customLink.label
  //     )

  //     if (linkIndex >= 0) {
  //       const updateLink = {
  //         ...customLink,
  //         featured,
  //       }

  //       // Replace updated item
  //       updatedCustomLinks.splice(linkIndex, 1, updateLink as any)

  //       setPublicCustomLinks(updatedCustomLinks)
  //       debounceSaveProfile({ customLinks: updatedCustomLinks })
  //     }
  //   },
  //   [debounceSaveProfile, publicCustomLinks]
  // )

  const fetchPublicProfile = async () => {
    try {
      setQuickFetching(true)
      const vault = AccountManager.getInstance().vault as any
      const publicData = await vault.profiles.public.getMany()

      dispatch(
        setPublicProfileByDid({
          did: currentAccountDID,
          publicProfile: publicData,
        })
      )
    } catch (error) {
      logger.error(error)
      Alert.alert('Error', 'Cannot load public profile data')
    } finally {
      setQuickFetching(false)
    }
  }

  // const fetchVeridaOneProfle = async () => {
  //   // Fetch Verida One Profile
  //   try {
  //     const oneProfile = (await VeridaOneManager.getProfile()) as any
  //     if (oneProfile) {
  //       setVeridaOneProfile(oneProfile)

  //       // Clone deep to avoid nested objects updating cross changes
  //       setPublicWalletAddresses(cloneDeep(oneProfile.walletAddresses))
  //       setPublicCustomLinks(cloneDeep(oneProfile.customLinks))
  //       setPlatformLinks(cloneDeep(oneProfile.platformLinks))

  //       // Update items order
  //       const updatedFeaturedAssets = oneProfile.featuredAssets.map(
  //         (asset: VeridaOneFeaturedAsset, idx: number) => ({
  //           ...asset,
  //           order: idx,
  //         })
  //       )
  //       setFeaturedAssets(updatedFeaturedAssets)
  //     }
  //   } catch (error) {
  //     logger.error(error)
  //     Alert.alert('Error', 'Cannot load Verida profile data')
  //   }
  // }

  const fetchUsername = async () => {
    try {
      const accountUsernames = await UsernameManager.get()
      if (accountUsernames.length > 0) {
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
    } catch (error) {
      logger.error(error)
    }
  }

  // const removeFeaturedAsset = useCallback(
  //   (featuredAsset: VeridaOneFeaturedAsset) => {
  //     let updatedFeaturedAssets = [...featuredAssets]
  //     const itemIndex = featuredAssets.findIndex(
  //       (it) =>
  //         featuredAsset.chainId === it.chainId &&
  //         featuredAsset.tokenId === it.tokenId &&
  //         featuredAsset.order === it.order
  //     )

  //     if (itemIndex >= 0) {
  //       updatedFeaturedAssets.splice(itemIndex, 1)
  //       // Update items order
  //       updatedFeaturedAssets = updatedFeaturedAssets.map((asset, idx) => ({
  //         ...asset,
  //         order: idx,
  //       }))

  //       setFeaturedAssets(updatedFeaturedAssets)
  //       debounceSaveProfile({ featuredAssets: updatedFeaturedAssets })
  //       Snackbar.show({
  //         text: 'Removed',
  //         duration: Snackbar.LENGTH_SHORT,
  //       })
  //     }
  //   },
  //   [debounceSaveProfile, featuredAssets]
  // )

  useEmitter(
    'UPDATE_PUBLIC_PROFILE',
    debounce(() => {
      fetchPublicProfile()
    }, 600)
  )

  useEmitter('UPDATE_PROFILE_USERNAME', () => {
    setLoading(true)
    fetchUsername().finally(() => {
      setLoading(false)
    })
  })

  useEffect(() => {
    // A little bit of delay here to avoid any unclean state when switching accounts
    const tid = setTimeout(() => {
      if (!currentAccountDID) return
      // setLoading(true)

      setProfileReadonlyProps([
        { label: 'DID', value: currentAccountDID, action: 'copy' },
      ])

      setUsername(undefined)
      Promise.all([fetchUsername()]).finally(() => {
        setLoading(false)
      })
    }, 200)

    return () => {
      clearTimeout(tid)
    }
  }, [currentAccountDID])

  return (
    <Screen
      backgroundGrey
      loadingOverlayColorLight
      withLoadingView
      showLoading={!loading && quickFetching}>
      {!currentAccountDID ? (
        <LoadingView />
      ) : (
        <NestableScrollContainer
          contentContainerStyle={{
            padding: theme.spacing.m,
            paddingBottom: 0,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <AvatarUploader
            style={{
              marginBottom: 24, // Should avoid inline style but this component is too big, it must be split into smaller components where it's easier to manage a stylesheet
            }}
          />

          <View style={{ marginTop: theme.spacing.m }}>
            <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
            <PropertyList
              list={[
                ...profileEditableProps.map((item) => ({
                  ...item,
                  onPress: () =>
                    navigation.navigate('EditProfile', {
                      title: item.label,
                      option: item,
                    }),
                })),
                ...profileReadonlyProps,
              ]}
            />
          </View>
        </NestableScrollContainer>
      )}
    </Screen>
  )
}

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
    },
    overlayContent: {
      ...StyleSheet.absoluteFillObject,
      marginHorizontal: -theme.spacing.m,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
    },
  })
