import { selectAccounts } from 'features/identities'
import {
  fetchAllPublicProfilesData,
  selectPublicProfiles,
} from 'features/profiles'
import React, { useCallback, useEffect, useMemo } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import { useAppDispatch, useAppSelector } from 'reduxStore/types'

import { AccountItem } from './AccountItem'

export type AccountsListProps = {
  containerStyle: ViewStyle
  onSelectAccount: (did: string) => void
  selectedDids: string[]
  multipleSelect?: boolean
  showSelectedOnly?: boolean
}

export function AccountsList(props: AccountsListProps) {
  const {
    onSelectAccount,
    containerStyle,
    selectedDids = [],
    multipleSelect,
    showSelectedOnly,
  } = props
  const dispatch = useAppDispatch()
  const publicProfiles = useAppSelector(selectPublicProfiles)
  const accounts = useAppSelector(selectAccounts)
  const accountIds = useMemo(() => {
    if (showSelectedOnly) {
      return Object.keys(accounts).filter((did) => selectedDids.includes(did))
    }
    return Object.keys(accounts)
  }, [accounts, selectedDids, showSelectedOnly])

  useEffect(() => {
    const promise = dispatch(fetchAllPublicProfilesData())
    return () => {
      promise?.abort()
    }
  }, [dispatch])

  const renderDivider = () => <View style={styles.divider} />

  const renderItem = useCallback(
    ({ item: did }: ListRenderItemInfo<string>) => {
      // const { did, publicProfile = {} } = info.item
      const publicProfile = publicProfiles[did]

      const { name = '', avatar = undefined } = publicProfile || {}

      const selected = selectedDids.indexOf(did) !== -1

      return (
        <AccountItem
          onSelect={onSelectAccount}
          name={name}
          did={did}
          avatar={avatar}
          selected={selected}
          multipleSelect={multipleSelect}
        />
      )
    },
    [publicProfiles, selectedDids, onSelectAccount, multipleSelect]
  )

  return (
    <FlatList<string>
      data={accountIds}
      renderItem={renderItem}
      contentContainerStyle={containerStyle}
      ItemSeparatorComponent={renderDivider}
      showsVerticalScrollIndicator={true}
    />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3C3C43',
    opacity: 0.4,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
})
