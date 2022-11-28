import { Container, Content } from 'native-base'
import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { storeChain } from 'api/utils'
import CustomFooter from 'components/Layouts/CustomFooter'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import Button from '../components/Button'
import Layout from '../components/Layouts/Layout'
import NetworkItem from '../components/NetworkItem'
import { NETWORKS } from '../helpers/networks'

export default (props) => {
  const [selected, setSelected] = useState(0)

  const onContinue = async () => {
    await storeChain(NETWORKS[selected].id)
    props.navigation.navigate('SeedPhraseEntered', { usePrivateKey: true })
  }

  return (
    <Container>
      <NavigationHeader title='Import An Account' />
      <Content>
        <Layout title='Select Network'>
          <View style={{ marginTop: 12 }}>
            {NETWORKS.map((network, index) => (
              <TouchableOpacity
                key={network.id}
                onPress={() => setSelected(index)}>
                <NetworkItem
                  selected={index === selected}
                  onSelect={setSelected}
                  network={network}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Layout>
      </Content>
      <CustomFooter>
        <Button color='primary' onPress={onContinue}>
          Continue
        </Button>
      </CustomFooter>
    </Container>
  )
}
