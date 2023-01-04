import { useTheme } from 'contexts/ThemeContext'
import { Container } from 'native-base'
import React, { useRef, useState } from 'react'
import { Image, StyleSheet, Text, useWindowDimensions } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import SegmentControl, { SegmentControlRef } from 'components/SegmentControl'
import WalletNavigationHeader from 'components/WalletSelectorNavigation/WalletNavigationHeader'
import WalletSelectorModal from 'components/WalletSelectorNavigation/WalletSelectorModal'
import Tokens from 'pages/Tokens/Dashboard'
import { selectChains } from 'reduxStore/tokens/selectors'
import { getSelectedWalletById } from 'reduxStore/wallet/selectors'

import Collectibles from './Assets/Collectibles'

const DefaultAvatar = require('assets/stubs/avatar.png')

const segmentLists = [
  {
    title: 'Coins',
  },
  {
    title: 'Collectibles',
  },
  {
    title: 'Badges',
  },
]
const TokensRoute = () => <Tokens />
const CollectiblesRoute = () => <Collectibles />
const BadgesRoute = () => <Text style={styles.container}>Badges</Text>

const renderScene = SceneMap({
  tokens: TokensRoute,
  nfts: CollectiblesRoute,
  badges: BadgesRoute,
})

enum Assets {
  COINS,
  COLLECTIBLES,
  BADGES,
}

const AssetsCollections = (props: any) => {
  const { selectedWallet } = props
  const [segments] = useState(segmentLists)
  const [modalVisible, setModalVisible] = useState(false)
  const [collection, setCollection] = useState<Assets>(Assets.COINS)
  const layout = useWindowDimensions()
  const segmentedControlRef = useRef<SegmentControlRef>(null)
  const { theme } = useTheme()

  const [routes] = React.useState([
    { key: 'tokens' },
    { key: 'nfts' },
    { key: 'badges' },
  ])

  const onChangedSegmentIndex = (index: number) => {
    setCollection(index)
  }

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
        left={{ icon: 'avatar' }}
        avatarIcon={<Image style={styles.avatarIcon} source={DefaultAvatar} />}
        // @TODO: develop a separate component to handle walletSelect navigation
        titleIcon={walletSelect}
      />

      <TabView
        lazy
        navigationState={{ index: collection, routes }}
        renderScene={renderScene}
        renderTabBar={(_props) => (
          <SegmentControl
            style={{ marginTop: theme.spacing.s }}
            ref={segmentedControlRef}
            segments={segments}
            initialIndex={0}
            onChangedSegmentIndex={onChangedSegmentIndex}
          />
        )}
        onIndexChange={(index) => {
          setCollection(index)
          segmentedControlRef.current?.setSelectedIndex(index)
        }}
        initialLayout={{ width: layout.width }}
      />
      <WalletSelectorModal
        modalVisible={modalVisible}
        onCloseModal={onCloseModal}
      />
    </Container>
  )
}

const mapStateToProps = (rootState: any) => {
  const state = rootState.main
  const chains = selectChains(rootState)
  return {
    selectedWallet: getSelectedWalletById(state, chains),
  }
}

export default connect(mapStateToProps)(AssetsCollections)

const styles = StyleSheet.create({
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
})
