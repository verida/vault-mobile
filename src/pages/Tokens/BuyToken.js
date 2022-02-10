import { Container, Icon } from 'native-base'
import React, { useState } from 'react'
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import MCIcon from 'assets/mastercard_logo.svg'
import MCIconColored from 'assets/mastercard_logo_colored.svg'
import VisaIcon from 'assets/visa_logo.svg'
import Button from 'components/Button'
import Label from 'components/Label'
import Layout from 'components/Layouts/Layout'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { PRIMARY_COLOR } from 'constants/color'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import InputStyles from 'styles/inputs'

export default ({ navigation }) => {
  const [cardNumber, setCardNumber] = useState('')

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
            style={[InputStyles.input, styles.input]}
            placeholder={'eg. John Smith'}
          />
          <View>
            <Label>Card number</Label>
            <TextInput
              value={cardNumber}
              autoFocus={true}
              multiline
              editable
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={setCardNumber}
              style={[InputStyles.input, styles.input]}
              placeholder={'XXXX XXXX XXXX XXXX'}
            />
            <View style={styles.cardLogos}>
              <View style={styles.cardLogo}>
                <VisaIcon />
              </View>
              <View style={styles.cardLogo}>
                {cardNumber.length > 0 ? <MCIconColored /> : <MCIcon />}
              </View>
            </View>
          </View>
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
                style={[InputStyles.input, styles.input]}
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
                style={[InputStyles.input, styles.input]}
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
            onPress={() => ({})}>
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
  input: { lineHeight: 26 },
  twinFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 10,
  },
  cardLogo: {
    marginLeft: 10,
  },
})
