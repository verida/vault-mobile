import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Container, Icon } from 'native-base'

import Text from 'components/Text'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenCalculator from 'components/Tokens/TokenCalculator'
import Button from 'components/Button'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import WalletIcon from 'assets/wallet_icon_small.svg'

import ChainlinkToken from 'assets/tokens/chainlink.svg'
import EthereumToken from 'assets/tokens/ethereum.svg'

const addressList = [
  { id: 1, address: '0vc029...fch8', amount: 8652, type: 'ETH' },
  { id: 2, address: '74ojk7...yz67', amount: 902, type: 'NEAR' },
  { id: 3, address: '1vc302...sks8', amount: 1023, type: 'ETH' },
]

const tokenList = [
  {
    id: 1,
    name: 'ChainLink',
    symbol: 'LINK',
    quantity: 820,
    icon: <ChainlinkToken />,
  },
  {
    id: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    quantity: 2.028,
    icon: <EthereumToken />,
  },
  {
    id: 3,
    name: 'ChainLink',
    symbol: 'LINK',
    quantity: 108,
    icon: <ChainlinkToken />,
  },
]

export default ({ navigation, route }) => {
  const [selectedAddress, onSelectAddress] = React.useState(null)
  const [selectedToken, onSelectToken] = React.useState(null)
  const [amount, onUpdateAmount] = React.useState(null)
  const token = route.params.token

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Send ' + token.symbol}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <TokenCalculator token={token} onUpdateAmount={onUpdateAmount} />

          {/* <Text style={styles.label}>Select address</Text>
          <View style={styles.addressScroller}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {addressList.map((item, index) => (
                <TouchableOpacity
                  onPress={() => onSelectAddress(item.id)}
                  key={item.id}
                  style={[
                    styles.singleAddress,
                    selectedAddress === item.id && styles.itemSelected,
                    addressList.length === index + 1 && styles.itemLast,
                  ]}>
                  <View style={styles.addressAmount}>
                    <Text style={styles.addressText}>{item.address}</Text>
                    <Text style={styles.amountText}>${item.amount}</Text>
                  </View>
                  <View style={styles.walletNameWrapper}>
                    <WalletIcon />
                    <Text style={styles.walletName}>{item.type} Wallet</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View> */}

          {/* <Text style={styles.label}>Select token</Text>
          <View style={styles.tokenScroller}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tokenList.map((item, index) => (
                <TouchableOpacity
                  onPress={() => onSelectToken(item.id)}
                  key={item.id}
                  style={[
                    styles.singleToken,
                    selectedToken === item.id && styles.itemSelected,
                    tokenList.length === index + 1 && styles.itemLast,
                  ]}>
                  {item.icon}
                  <View style={styles.nameQuantity}>
                    <Text style={styles.tokenName}>{item.name}</Text>
                    <Text style={styles.tokenQuantity}>
                      {item.quantity} {item.symbol}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
                </View>*/}
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            disabled={!(amount > 0)}
            // loading={processing}
            onPress={() =>
              navigation.navigate('TokenRecipient', { token, amount })
            }>
            Next
          </Button>
        </View>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(4, 17, 51, 0.1)',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  nextButton: {
    alignSelf: 'stretch',
  },
  label: {
    color: 'rgba(4, 17, 51, 0.7)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    marginBottom: 8,
  },
  addressScroller: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -15,
  },
  singleAddress: {
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    borderRadius: 4,
    width: 180,
    marginLeft: 15,
  },
  itemSelected: {
    backgroundColor: 'rgba(245, 244, 255, 1)',
    borderColor: 'rgba(66, 59, 206, 1)',
  },
  itemLast: {
    marginRight: 15,
  },
  addressAmount: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  walletNameWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 227, 234, 1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: 'rgba(4, 17, 51, 1)',
    lineHeight: 21,
  },
  amountText: { color: 'rgba(4, 17, 51, 0.5)', fontSize: 14 },
  walletName: {
    marginLeft: 9,
    color: 'rgba(4, 17, 51, 0.5)',
    fontSize: 14,
  },
  tokenScroller: {
    flexDirection: 'row',
    marginHorizontal: -15,
  },
  singleToken: {
    flexDirection: 'row',
    width: 180,
    borderWidth: 1,
    borderColor: 'rgba(224, 227, 234, 1)',
    padding: 8,
    marginLeft: 15,
    alignItems: 'center',
    borderRadius: 4,
  },
  nameQuantity: {
    marginLeft: 12,
  },
  tokenQuantity: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontSize: 14,
  },
  tokenName: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: 'rgba(4, 17, 51, 1)',
    lineHeight: 21,
  },
})
