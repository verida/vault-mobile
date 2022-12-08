import React, { useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { AssetManager } from 'api/AssetManager'
import LoadingIndicator from 'components/LoadingIndicator'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import {
  createErrorMessageSelector,
  createLoadingSelector,
} from 'reduxStore/api/selectors'
import { walletNFTCollectionsSelector } from 'reduxStore/collectibles/selectors'
import * as thunkActions from 'reduxStore/thunkActions'
import { Theme } from 'styles/types'

type CollectiblesProps = {}

const Collectibles = (props: CollectiblesProps) => {
  const dispatch = useDispatch()
  const styles = useThemeAwareStyle(createStyles)
  const isLoading = useReduxState(
    createLoadingSelector(['GET_WALLET_NFT_COLLECTIBLES_REQUEST'])
  )

  const error = useReduxState(
    createErrorMessageSelector(['GET_WALLET_NFT_COLLECTIBLES_REQUEST'])
  )
  const walletNFTCollections = useReduxState(walletNFTCollectionsSelector)

  useEffect(() => {
    dispatch(thunkActions.getWalletNFTCollections())
  }, [dispatch])

  useEffect(() => {
    console.log('data', walletNFTCollections)
  }, [walletNFTCollections])

  useEffect(() => {
    console.log('Loading', isLoading, error)
  }, [isLoading, error])

  if (isLoading) return <LoadingIndicator />

  return <FlatList style={styles.grid} data={[]} renderItem={() => null} />
}

export default Collectibles

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
  })
