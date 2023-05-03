import { Container, Icon } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import {
  formatTokenQuantity,
  getNativeForChain,
  getTokenChain,
  getWalletAddressForAsset,
} from 'wallet/helpers/tokens'

import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { selectTokens } from 'reduxStore/tokens/selectors'
import { sendTransaction } from 'reduxStore/wallet/actions'
import {
  getTransactionParamsData,
  getWalletsData,
  selectSentTransaction,
} from 'reduxStore/wallet/selectors'

const ConfirmTransaction = ({
  navigation,
  route,
  wallets,
  transactionParams,
  onSendTransaction,
  sentTransaction,
  tokens,
}) => {
  const { token, amount, address } = route.params
  const tokenChain = getTokenChain(token.asset)
  const accountAddress = getWalletAddressForAsset(token.asset, wallets)
  const nativeToken = getNativeForChain(tokens, token.chainName)

  let feeSymbol = nativeToken.symbol
  let feeDecimal = nativeToken.decimal
  let fixed
  let networkReference = token.referenceLabel
  switch (tokenChain) {
    case 'algorand':
      fixed = 3
      break
    case 'eip155':
      fixed = 18
      break
    case 'near':
      fixed = 8
      break
  }

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () => navigation.navigate('Tokens'),
        }}
        title={'Send ' + token.symbol}
      />
      <TestnetWarning networkReference={networkReference} />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From</Text>
            <View style={styles.infoValue}>
              <Text
                numberOfLines={1}
                ellipsizeMode='middle'
                style={styles.valueText}>
                {accountAddress}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token</Text>
            <View style={styles.infoValue}>
              <Text style={styles.valueText}>{token.label}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <View style={styles.infoValue}>
              <Text style={styles.valueText}>
                {parseFloat(amount).toFixed(3)} {token.symbol}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To</Text>
            <View style={styles.infoValue}>
              <Text
                numberOfLines={1}
                ellipsizeMode='middle'
                style={styles.valueText}>
                {address}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fee</Text>
            <View style={styles.infoValue}>
              <Text style={styles.valueText}>
                {formatTokenQuantity(transactionParams.fee, feeDecimal, fixed)}{' '}
                {feeSymbol}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            style={styles.nextButton}
            color='primary'
            loading={sentTransaction.fetching}
            onPress={() => onSendTransaction({ token, amount, address })}>
            Send {token.symbol}
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    color: 'rgba(4, 17, 51, 0.5)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
  },
  valueText: {
    color: 'rgba(4, 17, 51, 1)',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'right',
  },
  infoValue: {
    maxWidth: 240,
  },
})

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    wallets: getWalletsData(state),
    transactionParams: getTransactionParamsData(state),
    sentTransaction: selectSentTransaction(state),
    tokens: selectTokens(rootState),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSendTransaction: (params) => dispatch(sendTransaction(params)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmTransaction)
