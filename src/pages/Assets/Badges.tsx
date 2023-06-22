/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback, useEffect } from 'react'
import {
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'
import { VeridaWallet } from 'types/wallet'

import { NFT, NFTCollection, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import { NftItem } from 'components/Assets/NftItem'
import Button from 'components/Button'
import GridView from 'components/Grids/GridView'
import { Line } from 'components/Line'
import LoadingIndicator from 'components/LoadingIndicator'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { useGetWalletNFTCollectionsQuery } from 'reduxStore/assets/api'
import {
  allWalletsSelector,
  getUniqueWalletAddresses,
  selectedWalletSelector,
} from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const Badges = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <View style={styles.container}>
      <Line style={{ marginTop: theme.spacing.s }} />
      <Button
        style={{ margin: theme.spacing.m }}
        onPress={() => navigation.navigate('ClaimableBadges')}>
        Claim Badges
      </Button>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    grid: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    listEmptyContainer: { height: '100%' },
    column: {
      flex: 0.48,
    },
    image: {
      width: IMAGE_WIDTH,
      minHeight: IMAGE_WIDTH,
      borderRadius: theme.roundness.xs,
    },
    itemTag: {
      position: 'absolute',
      left: theme.spacing.s,
      bottom: theme.spacing.s,
    },
    tagLabel: {
      maxWidth: 0.68 * IMAGE_WIDTH,
      color: theme.color.onPrimary,
    },
    tagLabelNumber: {
      marginLeft: theme.spacing.s,
      color: theme.color.onPrimary,
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

export default Badges
