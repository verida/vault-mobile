import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Container, Content } from 'native-base';

import Layout from '../components/Layouts/Layout';
import NetworkItem from '../components/NetworkItem';
import Button from '../components/Button';
import NavigationHeader from 'components/Navigation/NavigationHeader';
import { NETWORKS } from '../helpers/networks';


export default (props) => {
  const [selected, setSelected] = useState(null);
  
  const onContinue = () => props.navigation.navigate('SeedPhraseEntered');
  
  return (
    <Container>
      <NavigationHeader title="Import An Account" />
      <Content>
        <Layout title="Select Network">
          <View style={{ marginTop: 12 }}>
            { NETWORKS.map(network =>
              <TouchableOpacity key={network.id} onPress={() => setSelected(network.id)}>
                <NetworkItem
                  selected={network.id === selected}
                  onSelect={setSelected}
                  network={network} />
              </TouchableOpacity>
            )
            }
          </View>
          <Button style={{ marginTop: 24 }}
            color="primary"
            onPress={onContinue}
            disabled={!selected}>
                        Continue
          </Button>
        </Layout>
      </Content>
    </Container>
  );
};
