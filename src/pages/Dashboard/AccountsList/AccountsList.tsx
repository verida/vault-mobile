import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { Account } from 'api/types'
import AccountItem from 'pages/Dashboard/AccountsList/AccountItem'
import AccountManager from 'api/AccountManager'
import { fetchPublicProfileData } from 'api/utils'
import LoadingView from 'components/LoadingView'

export type AccountsListProps = {
  containerStyle: ViewStyle
  onSelectAccount: (did: string) => void
}

function AccountsList(props: AccountsListProps) {
  const { onSelectAccount, containerStyle } = props
  const [data, setData] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const normalizedData = await fetchPublicProfileData()
      setData(Object.values(normalizedData))
      setLoading(false)
    }

    fetchData()
  }, [])

  const renderDivider = () => <View style={styles.divider} />

  const renderItem = useCallback(
    (info: ListRenderItemInfo<Account>) => {
      const { did, publicProfile = {} } = info.item

      const selected = AccountManager.getInstance().selectedAccount?.did === did

      return (
        <AccountItem
          onSelect={onSelectAccount}
          name={publicProfile.name}
          did={did}
          avatar={publicProfile.avatar}
          selected={selected}
        />
      )
    },
    [onSelectAccount]
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingView type={'small'} />
      </View>
    )
  }

  return (
    <FlatList<Account>
      data={data}
      renderItem={renderItem}
      contentContainerStyle={containerStyle}
      ItemSeparatorComponent={renderDivider}
    />
  )
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3C3C43',
    marginVertical: 10,
    opacity: 0.4,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
})

export default AccountsList
