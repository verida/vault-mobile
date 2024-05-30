import React, { useCallback, useEffect } from 'react'
import {
  FlatList,
  InteractionManager,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'

import {
  selectAccounts,
  useCurrentIdentity,
  useIdentities,
} from '~/features/identities'
import {
  fetchAllPublicProfilesData,
  PublicProfile,
  selectPublicProfiles,
} from '~/features/profiles'
import { useThemeAwareStyle } from '~/hooks'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

import { DrawerIdentityListItem } from './DrawerIdentityListItem'

type IdentityItem = {
  did: string
  profile: PublicProfile
}

export type DrawerIdentityListProps = {
  onIdentitySwitch?: () => void
} & ViewProps

export const DrawerIdentityList: React.FunctionComponent<
  DrawerIdentityListProps
> = (props) => {
  const { onIdentitySwitch, ...viewProps } = props

  const styles = useThemeAwareStyle(createStyles)

  const { switchIdentity } = useIdentities()
  const dispatch = useAppDispatch()
  useEffect(() => {
    const promise = dispatch(fetchAllPublicProfilesData())
    return () => {
      promise?.abort()
    }
  }, [dispatch])

  const identities = useAppSelector(selectAccounts)
  const identityDids = Object.keys(identities)

  const currentIdentity = useCurrentIdentity()
  const publicProfiles = useAppSelector(selectPublicProfiles)
  const identityProfiles: IdentityItem[] = Object.entries(publicProfiles)
    .filter(([did]) => identityDids.includes(did)) // Cache issue in selectPublicProfiles after removing identities, the profiles stays. Have to get the list of identities with selectAccounts and keep only the profile from DID still here
    .map(([did, profile]) => ({
      did,
      profile,
    }))

  const handleItemPress = useCallback(
    (did: string) => {
      onIdentitySwitch?.()

      // TODO: Use switchIdentity from useIdentities
      InteractionManager.runAfterInteractions(async () => {
        await switchIdentity(did)
      })
    },
    [onIdentitySwitch, switchIdentity]
  )

  const renderItem = useCallback(
    ({ item: identity }: ListRenderItemInfo<IdentityItem>) => {
      const current = identity.did === currentIdentity?.did
      return (
        <DrawerIdentityListItem
          did={identity.did}
          profile={identity.profile}
          isCurrent={current}
          onPress={handleItemPress}
        />
      )
    },
    [currentIdentity, handleItemPress]
  )

  const renderSeparator = () => <View style={styles.separator} />

  return (
    <View {...viewProps}>
      <FlatList<IdentityItem>
        data={identityProfiles}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={true}
      />
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: theme.color.lightGrey,
    },
  })
