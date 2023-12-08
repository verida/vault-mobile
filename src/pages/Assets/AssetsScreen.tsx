import { getSelectedWalletById } from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import { Container } from 'native-base'
import React, { useState } from 'react'
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { SegmentData, SegmentsControl } from 'components/SegmentControl'
import WalletNavigationHeader from 'components/WalletSelectorNavigation/WalletNavigationHeader'
import WalletSelectorModal from 'components/WalletSelectorNavigation/WalletSelectorModal'
import { TabsScreenProps } from 'navigation/types'
import Tokens from 'pages/Tokens/Dashboard'
import { useAppSelector } from 'reduxStore/types'
import { Theme } from 'styles/types'

import Collectibles from './Collectibles'

const DefaultAvatar = require('assets/stubs/avatar.png')

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

const TokensRoute = () => <Tokens />
const CollectiblesRoute = () => <Collectibles />
// const BadgesRoute = () => <Text style={styles.container}>Badges</Text>

const renderScene = SceneMap({
  coins: TokensRoute,
  collectibles: CollectiblesRoute,
  // badges: BadgesRoute,
})

export type AssetsScreenParams = undefined

type AssetsScreenProps = TabsScreenProps<'Assets'>

export const AssetsScreen: React.FC<AssetsScreenProps> = () => {
  const selectedWallet = useAppSelector(getSelectedWalletById)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const layout = useWindowDimensions()

  const styles = useThemeAwareStyle(createStyles)

  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const openWalletModal = () => {
    setModalVisible(!modalVisible)
  }

  const walletSelect = (
    <WalletNavigationHeader
      selectedWallet={selectedWallet}
      openWalletModal={openWalletModal}
    />
  )

  return (
    <Container>
      <NavigationHeader
        left={{ icon: 'skip' }}
        avatarIcon={<Image style={styles.avatarIcon} source={DefaultAvatar} />}
        // @TODO: develop a separate component to handle walletSelect navigation
        titleIcon={walletSelect}
        bottomBorder={false}
      />
      <View style={styles.tabsContainer}>
        <SegmentsControl
          segments={segments}
          activeSegmentIndex={activeTabIndex}
          onSegmentPress={setActiveTabIndex}
        />
      </View>
      {/* <Line /> */}
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
      borderBottomWidth: 1,
      borderBottomColor: theme.color.separatorLight,
    },
  })
