import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParams } from 'navigation/types'
import {
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container, Content } from 'native-base'
import NodeItem from 'pages/StorageNodes/NodeItem'
import { NUNITO_SANS_BOLD } from 'constants/text'
import Text from 'components/Text'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { NetworkNode } from 'api/types'

function StorageNodes(
  _props: NativeStackScreenProps<MainStackParams, 'StorageNodes'>
) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const networks = useSelector((state) => state.networks)
  const selectedNode = !isEmpty(networks)
    ? networks[0].nodes[networks[0].selected_node]
    : null

  function renderItem(info: ListRenderItemInfo<NetworkNode>) {
    const { item } = info

    return (
      <NodeItem
        data={item}
        selected={item.node_code === selectedNode.node_code}
      />
    )
  }

  function renderSeparator() {
    return <View style={styles.separator} />
  }

  async function onHostButtonPress() {
    const url = 'https://developers.verida.io/docs/storage-node'
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      Linking.openURL(url)
    }
  }

  if (isEmpty(networks)) {
    return null
  }

  return (
    <Container style={styles.container}>
      <NavigationHeader title={'Storage'} />
      <Content>
        <FlatList
          data={networks[0].nodes}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
        />
        <TouchableOpacity style={styles.otherButton} disabled={true}>
          <Text style={styles.otherButtonText}>Other...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hostButton} onPress={onHostButtonPress}>
          <Text style={styles.hostButtonText}>Host my own node</Text>
          <Image
            style={styles.hostButtonIcon}
            source={require('assets/icons/share_icon.png')}
          />
        </TouchableOpacity>
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  list: {
    backgroundColor: 'white',
    marginTop: 25,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(60, 60, 67, 0.4)`,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `rgba(60, 60, 67, 0.4)`,
  },
  otherButton: {
    paddingHorizontal: 17,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: `rgba(60, 60, 67, 0.4)`,
  },
  otherButtonText: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    opacity: 0.5,
  },
  hostButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 33,
  },
  hostButtonIcon: {
    width: 19,
    height: 19,
    resizeMode: 'cover',
  },
  hostButtonText: {
    fontSize: 16,
    color: '#423BCE',
    fontFamily: NUNITO_SANS_BOLD,
    flex: 1,
  },
})

export default StorageNodes
