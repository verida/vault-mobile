import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, RefreshControl, StyleSheet, View } from 'react-native'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'
import { useSelector } from 'react-redux'

import AccountManager from '~/api/AccountManager'
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
import { useEmitter } from '~/hooks/useEmitter'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { MainStackScreenProps } from '~/navigation/types'
import { EditProfilePropertyOption } from '~/pages/Profiles/EditProfileScreen'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

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
  const [quickFetching, setQuickFetching] = useState<boolean>(false) // Manage a lighter loading indicator for a better UX

  const selectedAccount = useSelector(selectSelectedAccount)!
  const currentAccountDID = selectedAccount?.did

  const dispatch = useAppDispatch()

  const styles = useThemeAwareStyle(createStyles)

  // pull to refresh data
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([fetchPublicProfile()]).finally(() => {
      setRefreshing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEmitter(
    'UPDATE_PUBLIC_PROFILE',
    debounce(() => {
      fetchPublicProfile()
    }, 600)
  )

  useEffect(() => {
    // A little bit of delay here to avoid any unclean state when switching accounts
    const tid = setTimeout(() => {
      if (!currentAccountDID) return
      setProfileReadonlyProps([
        { label: 'DID', value: currentAccountDID, action: 'copy' },
      ])
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
      showLoading={quickFetching}>
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
