import React from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { MainStackParams } from 'navigation/types'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Container, Content } from 'native-base'
import NodeItem, { NetworkNode } from 'pages/StorageNodes/NodeItem'
import { NUNITO_SANS_BOLD } from 'constants/text'
import Text from 'components/Text'

const data = {
  networks: [
    {
      name: 'testnet',
      default_node_code: 'TN_V_USE1',
      nodes: [
        {
          node_code: 'TN_V_SG1',
          name: 'Testnet Verida Singapore',
          description: 'Verida Singapore Node',
          ISO2_CC: 'SG',
          address: 'url_here',
        },
        {
          node_code: 'TN_V_USE1',
          name: 'Testnet Verida US',
          description: 'Testnet Verida US Node',
          ISO2_CC: 'US',
          address: 'url_here',
        },
        {
          node_code: 'TN_V_ZA1',
          name: 'Testnet Verida South Africa',
          description: 'Testnet Verida South Africa',
          ISO2_CC: 'ZA',
          address: 'url_here',
        },
      ],
    },
    {
      name: 'mainnet',
      nodes: [],
    },
  ],
}

function StorageNodes(
  props: NativeStackScreenProps<MainStackParams, 'StorageNodes'>
) {
  function renderItem(info: ListRenderItemInfo<NetworkNode>) {
    const { item, index } = info

    return <NodeItem data={item} selected={index === 0} />
  }

  function renderSeparator() {
    return <View style={styles.separator} />
  }

  return (
    <Container style={styles.container}>
      <Content>
        <FlatList
          data={data.networks[0].nodes}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
        />
        <TouchableOpacity style={styles.otherButton} disabled={true}>
          <Text style={styles.otherButtonText}>Other...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hostButton} disabled={true}>
          <Text style={styles.otherButtonText}>Other...</Text>
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
})

export default StorageNodes
