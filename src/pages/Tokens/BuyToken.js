import React from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Container, Icon } from 'native-base'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import Label from 'components/Label'
import Button from 'components/Button'
import InputStyles from 'styles/inputs'
import Layout from 'components/Layouts/Layout'

import { PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

export default ({ navigation }) => {
  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title='Buy ETH'
        rightComponent={<Text style={styles.timer}>05:19</Text>}
      />
      <Layout style={styles.container}>
        <View style={styles.content}>
          <Label>Name on card</Label>
          <TextInput
            // value={name}
            autoFocus={true}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            // onChangeText={setName}
            style={[InputStyles.input]}
            placeholder={'eg. John Smith'}
          />
          <Label>Card number</Label>
          <TextInput
            // value={name}
            autoFocus={true}
            multiline
            editable
            autoCorrect={false}
            autoCapitalize='none'
            // onChangeText={setName}
            style={[InputStyles.input]}
            placeholder={'XXXX XXXX XXXX XXXX'}
          />
          <View style={styles.twinFields}>
            <View style={{ flex: 1, marginRight: 20 }}>
              <Label>Expiration date</Label>
              <TextInput
                // value={name}
                autoFocus={true}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize='none'
                // onChangeText={setName}
                style={[InputStyles.input]}
                placeholder={'MM / YY'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Label>CVC</Label>
              <TextInput
                // value={name}
                autoFocus={true}
                multiline
                editable
                autoCorrect={false}
                autoCapitalize='none'
                // onChangeText={setName}
                style={[InputStyles.input]}
                placeholder={'123'}
              />
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.saveButton}
            color='primary'
            // disabled={!name}
            onPress={() => console.log()}>
            Buy
          </Button>
          <TouchableOpacity>
            <Image
              style={{ width: '100%' }}
              source={require('assets/apple_pay_button.png')}
            />
          </TouchableOpacity>
        </View>
      </Layout>
    </Container>
  )
}

const styles = StyleSheet.create({
  timer: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontFamily: NUNITO_SANS_SEMIBOLD,
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.2)',
  },
  content: {
    flex: 1,
  },
  footer: {
    // justifyContent: 'space-between',
    // flexDirection: 'row',
  },
  twinFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
