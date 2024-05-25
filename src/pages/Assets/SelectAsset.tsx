import React, { useCallback, useEffect } from 'react'
import {
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import NFTPlaceholder from '~/assets/stubs/nft_placeholder.svg'
import { ScreenWrapper } from '~/components'
import { NftItem } from '~/components/Assets/NftItem'
import GridView from '~/components/Grids/GridView'
import LoadingView from '~/components/LoadingView'
import { Title } from '~/components/Typography/Title'
import { useTheme } from '~/contexts'
import { NFT, NFTMetadata, useGetNFTsQuery } from '~/features/assets'
import { Logger } from '~/features/telemetry'
import { emitter } from '~/helpers/emitter'
import { getNFTImageUri } from '~/helpers/nft'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation'
import { NUMBER_OF_COLUMNS } from '~/pages/Assets/constants'
import { Theme } from '~/styles/types'

const logger = Logger.create('Pages/SelectAsset')

export type SelectAssetScreenParams = {
  searchableAddresses: string[]
  screenName: string
  mode: string | number
  originalValue: any
}

type SelectAssetScreenProps = MainStackScreenProps<'SelectAsset'>

export const SelectAssetScreen: React.FC<SelectAssetScreenProps> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { screenName, mode, originalValue, searchableAddresses } = params

  const { data, isLoading, refetch } = useGetNFTsQuery(searchableAddresses)

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
  const isEmptyList = !data || data.length === 0
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
      } catch (error) {
        logger.error(error)
      }

      return null
    },
    [mode, navigation, originalValue, screenName]
  )

  useEffect(() => {
    navigation.setOptions({
      title: 'Select Asset',
    })
  }, [navigation])

  return (
    <ScreenWrapper>
      {isLoading ? (
        <LoadingView />
      ) : (
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
      )}
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    constainer: {
      flex: 1,
    },
    grid: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    listEmptyContainer: {
      flex: 1,
      flexDirection: 'column',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
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
