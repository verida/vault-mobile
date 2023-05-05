import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { emitter } from 'helpers/emitter'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback } from 'react'
import {
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { VeridaWallet } from 'types/wallet'

import { NFT, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import { NftItem } from 'components/Assets/NftItem'
import GridView from 'components/Grids/GridView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Title } from 'components/Typography/Title'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { NUMBER_OF_COLUMNS } from 'pages/Assets/constants'
import { useGetWalletNFTCollectionsQuery } from 'reduxStore/assets/api'
import {
  allWalletsSelector,
  getUniqueWalletAddresses,
  selectedWalletSelector,
} from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

export interface SelectAssetScreenProps {
  screenName: string
  mode: string | number
  originalValue: any
}

const SelectAsset = () => {
  const navigation = useNavigation()
  const params = useParams<SelectAssetScreenProps>()
  const { screenName, mode, originalValue } = params
  const selectedWalletId = useSelector(selectedWalletSelector)
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    VeridaWallet
  >

  const selectedWallet = wallets[selectedWalletId]
  const addresses = getUniqueWalletAddresses(selectedWallet)

  const { data, isLoading, error, refetch } =
    useGetWalletNFTCollectionsQuery(addresses)

  // pull to refresh data
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    refetch().finally(() => {
      setRefreshing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { theme } = useTheme()
  const isEmptyList = data?.length === 0
  const styles = useThemeAwareStyle(createStyles)
  const { bottom } = useSafeAreaInsets()

  // Temp code
  const renderNft = useCallback<ListRenderItem<NFT>>(
    ({ item }) => {
      try {
        const imageMeta = (item?.metadata as unknown as NFTMetadata) ?? {
          image: null,
        }
        const uri = getNFTImageUri(imageMeta.image)
        return (
          <TouchableOpacity
            onPress={() => {
              emitter.emit('SAVE_GENERIC_PROPERTY', {
                screenName,
                mode,
                value: {
                  chainId: item.chain_id,
                  contractAddress: item.token_address,
                  tokenId: item.token_id,
                  ownerAddress: item.owner_address,
                  order: originalValue?.order ?? 0,
                  uri: uri,
                },
                originalValue,
              })
              navigation.goBack()
            }}>
            <View style={{}}>
              <NftItem nft={item} />
            </View>
          </TouchableOpacity>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [mode, navigation, originalValue, screenName]
  )

  return (
    <Screen withLoadingView showLoading={isLoading} loadingOverlayColorLight>
      <NavigationHeader
        title={'Select Asset'}
        left={{
          icon: 'close',
        }}
      />
      {data ? (
        <View style={[styles.constainer, { marginBottom: bottom }]}>
          <GridView
            numColumns={NUMBER_OF_COLUMNS}
            data={data}
            style={styles.grid}
            contentContainerStyle={
              isEmptyList
                ? styles.listEmptyContainer
                : {
                    paddingBottom: theme.spacing.xxl,
                    paddingTop: theme.spacing.m,
                  }
            }
            keyExtractor={(item, index) =>
              `${index}-${item.chain_id}-${item.token_id}-${item.owner_address}`
            }
            renderItem={renderNft}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <NFTPlaceholder />
                <Title style={styles.emptyListTitle}>
                  {"You don't have any collectibles yet"}
                </Title>
              </View>
            )}
          />
        </View>
      ) : null}
    </Screen>
  )
}

export default SelectAsset

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    constainer: {
      flex: 1,
      // paddingHorizontal: theme.spacing.m,
      // paddingTop: theme.spacing.m,
      // justifyContent: 'space-between',
    },
    grid: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    listEmptyContainer: { height: '100%' },
    emptyListContainer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xxxxl,
    },
    emptyListTitle: {
      fontSize: theme.fontSize.xxl,
      marginTop: theme.spacing.m,
      textAlign: 'center',
    },
  })
