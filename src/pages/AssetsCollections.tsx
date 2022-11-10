import { useNavigation } from '@react-navigation/native'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { StyleSheet, Text } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import SegmentControl from 'components/SegmentControl'
import Tokens from 'pages/Tokens/Dashboard'

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

enum Assets {
  COINS,
  COLLECTIBLES,
  BADGES,
}

const AssetsCollections = () => {
  const navigation = useNavigation()
  const [segments] = useState(segmentLists)
  const [collection, setCollection] = useState<Assets>(Assets.COINS)

  const onChangedSegmentIndex = (index: number) => {
    setCollection(index)
  }

  const renderAssets = () => {
    switch (collection) {
      case Assets.COINS:
        return <Tokens navigation={navigation} />
      case Assets.COLLECTIBLES:
        return <Text style={styles.container}>Collectibles</Text>
      case Assets.BADGES:
        return <Text style={styles.container}>Badges</Text>
    }
  }

  return (
    <Container>
      <NavigationHeader title='Main Wallet' />
      <SegmentControl
        segments={segments}
        onChangedSegmentIndex={onChangedSegmentIndex}
      />
      <Content>{renderAssets()}</Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
  },
})

export default AssetsCollections
