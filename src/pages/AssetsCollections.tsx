import { useNavigation } from '@react-navigation/native'
import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import SegmentControl from 'components/SegmentControl'

import Tokens from 'pages/Tokens/Dashboard'

import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MainStackParams } from 'navigation/types'

import WalletSelectorHeader from 'components/WalletSelectorNavigation/WalletSelectorHeader'

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

enum Assets {
  COINS,
  COLLECTIBLES,
  BADGES,
}

const AssetsCollections = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
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
      <NavigationHeader
        left={{ icon: 'avatar', }}
        avatarIcon={<Image style={styles.avatarIcon} source={DefaultAvatar} />}
        titleIcon={<WalletSelectorHeader />}
      />
      <View>
        <SegmentControl
          segments={segments}
          onChangedSegmentIndex={onChangedSegmentIndex}
        />
      </View>
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
  avatarIcon: {
    width: 32,
    height: 32,
    marginBottom: 3,
  },
})
export default AssetsCollections
