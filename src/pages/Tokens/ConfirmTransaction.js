import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'

import Text from 'components/Text'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Button from 'components/Button'

import { sendTransaction } from 'reduxStore/wallet/actions'
import { SUPPORTED_TOKENS } from 'wallet/constants'
import { getTokenChain } from 'wallet/helpers/tokens'

import {
  getWalletsData,
  getTransactionParamsData,
  selectSentTransaction,
} from 'reduxStore/wallet/selectors'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'

const ConfirmTransaction = ({
  navigation,
  route,
  wallets,
  transactionParams,
  onSendTransaction,
  sentTransaction,
}) => {
  const { token, amount, address } = route.params
  const tokenChain = getTokenChain(token.address)
  const accountAddress =
    tokenChain === 'algorand' ? wallets.algo.address : wallets.ethr.address

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () => navigation.navigate('Tokens'),
        }}
        title={'Send ' + token.symbol}
      />
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
                {parseFloat(transactionParams.fee)} {SUPPORTED_TOKENS[0].symbol}
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

const mapStateToProps = (state) => {
  return {
    wallets: getWalletsData(state),
    transactionParams: getTransactionParamsData(state),
    sentTransaction: selectSentTransaction(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSendTransaction: (params) => dispatch(sendTransaction(params)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmTransaction)
