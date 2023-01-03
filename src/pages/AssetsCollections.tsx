import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { connect } from 'react-redux'
import { WalletItem } from 'types/wallet'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import SegmentControl from 'components/SegmentControl'
import WalletNavigationHeader from 'components/WalletSelectorNavigation/WalletNavigationHeader'
import WalletSelectorModal from 'components/WalletSelectorNavigation/WalletSelectorModal'
import { MainStackParams } from 'navigation/types'
import ClaimableBadges from 'pages/ClaimBadges/ClaimableBadges'
import Tokens from 'pages/Tokens/Dashboard'
import { selectChains } from 'reduxStore/tokens/selectors'
import { getSelectedWalletById } from 'reduxStore/wallet/selectors'

const DefaultAvatar = require('assets/stubs/avatar.png')

enum Assets {
  COINS,
  COLLECTIBLES,
  BADGES,
}

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

type AssetsCollectionsProps = {
  selectedWallet: WalletItem | undefined
}

const AssetsCollections: React.FC<AssetsCollectionsProps> = ({
  selectedWallet,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  const [segments] = useState(segmentLists)
  const [modalVisible, setModalVisible] = useState(false)
  const [collection, setCollection] = useState<Assets>(Assets.COINS)

  const onChangedSegmentIndex = (index: number) => {
    setCollection(index)
  }

  const onCloseModal = () => {
    setModalVisible(!modalVisible)
  }

  const openWalletModal = () => {
    setModalVisible(!modalVisible)
  }

  const renderAssets = () => {
    switch (collection) {
      case Assets.COINS:
        return <Tokens navigation={navigation} />
      case Assets.COLLECTIBLES:
        return <Text style={styles.container}>Collectibles</Text>
      case Assets.BADGES:
        return <ClaimableBadges />
    }
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
      <View>
        <SegmentControl
          segments={segments}
          onChangedSegmentIndex={onChangedSegmentIndex}
        />
      </View>
      <Content>{renderAssets()}</Content>
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
