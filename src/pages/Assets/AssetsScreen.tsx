import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { TabScreenHeader } from 'components'
import {
  useCryptoWalletsStatus,
  useSelectedCryptoWallet,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import { Container } from 'native-base'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'

import { SegmentData, SegmentsControl } from 'components/SegmentControl'
import { WalletNavigationHeader } from 'components/WalletSelectorNavigation/WalletNavigationHeader'
import WalletSelectorModal from 'components/WalletSelectorNavigation/WalletSelectorModal'
import { TabsScreenProps } from 'navigation/types'
import { TokenDashboard } from 'pages/Tokens/TokenDashboard'
import { Theme } from 'styles/types'

import Collectibles from './Collectibles'

const segments: SegmentData[] = [
  {
    key: 'coins',
    title: 'Coins',
  },
  {
    key: 'collectibles',
    title: 'Collectibles',
  },
  // {
  //  key: 'badges',
  //   title: 'Badges',
  // },
]

const TokensRoute = () => <TokenDashboard />
const CollectiblesRoute = () => <Collectibles />
// const BadgesRoute = () => <Text style={styles.container}>Badges</Text>

const renderScene = SceneMap({
  coins: TokensRoute,
  collectibles: CollectiblesRoute,
  // badges: BadgesRoute,
})

export type AssetsScreenParams = undefined

type AssetsScreenProps = TabsScreenProps<'Assets'>

export const AssetsScreen: React.FC<AssetsScreenProps> = (props) => {
  const { navigation } = props

  const { processsing: cryptoWalletProcessing } = useCryptoWalletsStatus()
  const selectedCryptoWallet = useSelectedCryptoWallet()
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const layout = useWindowDimensions()

  const styles = useThemeAwareStyle(createStyles)

  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const openWalletModal = useCallback(() => {
    setModalVisible((prevModalVisible) => !prevModalVisible)
  }, [])

  const walletSelect = useMemo(
    () => (
      <WalletNavigationHeader
        isWalletLoading={cryptoWalletProcessing && !selectedCryptoWallet}
        selectedWallet={selectedCryptoWallet}
        onPress={openWalletModal}
      />
    ),
    [cryptoWalletProcessing, openWalletModal, selectedCryptoWallet]
  )

  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until the branch reworking the header is merged
      header: (headerProps: BottomTabHeaderProps) => (
        <TabScreenHeader hideSeparator {...headerProps} />
      ),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore until the branch reworking the header is merged
      headerTitle: walletSelect,
    })
  }, [navigation, walletSelect])

  return (
    <Container>
      <View style={styles.tabsContainer}>
        <SegmentsControl
          segments={segments}
          activeSegmentIndex={activeTabIndex}
          onSegmentPress={setActiveTabIndex}
        />
      </View>
      <TabView
        lazy
        navigationState={{ index: activeTabIndex, routes: segments }}
        renderScene={renderScene}
        renderTabBar={() => null}
        onIndexChange={setActiveTabIndex}
        initialLayout={{ width: layout.width }}
      />
      <WalletSelectorModal
        modalVisible={modalVisible}
        onCloseModal={onCloseModal}
      />
    </Container>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: 20,
      marginVertical: 10,
    },
    avatarIcon: {
      width: 32,
      height: 32,
      marginBottom: 3,
    },
    tabsContainer: {
      marginTop: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      paddingBottom: theme.spacing.sm,
    },
  })
