import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { TabScreenHeader } from 'components'
import { useTheme } from 'contexts/ThemeContext'
import { getSelectedWalletById } from 'features/cryptoWallet'
import { Container } from 'native-base'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { connect } from 'react-redux'

import SegmentControl, { SegmentControlRef } from 'components/SegmentControl'
import WalletNavigationHeader from 'components/WalletSelectorNavigation/WalletNavigationHeader'
import WalletSelectorModal from 'components/WalletSelectorNavigation/WalletSelectorModal'
import Tokens from 'pages/Tokens/Dashboard'

import Collectibles from './Assets/Collectibles'

const segmentLists = [
  {
    title: 'Coins',
  },
  {
    title: 'Collectibles',
  },
  // {
  //   title: 'Badges',
  // },
]

const TokensRoute = () => <Tokens />
const CollectiblesRoute = () => <Collectibles />
// const BadgesRoute = () => <Text style={styles.container}>Badges</Text>

const renderScene = SceneMap({
  tokens: TokensRoute,
  nfts: CollectiblesRoute,
  // badges: BadgesRoute,
})

enum Assets {
  COINS,
  COLLECTIBLES,
  BADGES,
}

const AssetsCollections = (props: any) => {
  const { selectedWallet } = props

  const navigation = useNavigation()

  const [segments] = useState(segmentLists)
  const [modalVisible, setModalVisible] = useState(false)
  const [collection, setCollection] = useState<Assets>(Assets.COINS)
  const layout = useWindowDimensions()
  const segmentedControlRef = useRef<SegmentControlRef>(null)
  const { theme } = useTheme()

  const [routes] = React.useState([
    { key: 'tokens' },
    { key: 'nfts' },
    // { key: 'badges' },
  ])

  const onChangedSegmentIndex = (index: number) => {
    setCollection(index)
  }

  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const openWalletModal = useCallback(() => {
    setModalVisible((prevModalVisible) => !prevModalVisible)
  }, [])

  const walletSelect = useMemo(
    () => (
      <WalletNavigationHeader
        selectedWallet={selectedWallet}
        openWalletModal={openWalletModal}
      />
    ),
    [openWalletModal, selectedWallet]
  )

  useEffect(() => {
    navigation.setOptions({
      header: (headerProps: BottomTabHeaderProps) => (
        <TabScreenHeader hideSeparator {...headerProps} />
      ),
      headerTitle: walletSelect,
    })
  }, [navigation, walletSelect])

  return (
    <Container>
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

const mapStateToProps = (state: any) => {
  return {
    selectedWallet: getSelectedWalletById(state),
  }
}

export default connect(mapStateToProps)(AssetsCollections)
