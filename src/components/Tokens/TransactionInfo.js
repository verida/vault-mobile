import React from 'react'
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native'
import { Icon } from 'native-base'
import Clipboard from '@react-native-community/clipboard'

import Text from 'components/Text'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import CompleteSVG from 'assets/complete.svg'

export default ({ transaction }) => {
  var formattedTime = new Date(transaction.time * 1000).toLocaleString('en-US')

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={styles.infoValue}>
            <CompleteSVG />
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Quantity</Text>
          <View style={styles.infoValue}>
            <Text
              style={[
                styles.valueText,
                transaction.type === 'sent' ? styles.negative : styles.positive,
              ]}>
              {transaction.type === 'sent' ? '-' : ''}
              {parseFloat(transaction.quantity / 1000000).toFixed(3)}{' '}
              {transaction.symbol}
            </Text>
          </View>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>
            {transaction.type === 'sent' ? 'To' : 'From'}
          </Text>
          <View style={styles.infoValueFull}>
            <Text
              numberOfLines={1}
              style={[styles.valueText, styles.valueTextFull]}>
              {transaction.address}
            </Text>
            <TouchableOpacity
              onPress={() => Clipboard.setString(transaction.address)}
              style={styles.copyButton}>
              <Icon
                name='copy-outline'
                style={{ color: 'rgba(66, 59, 206, 1)', fontSize: 22 }}
              />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fee</Text>
          <View style={styles.infoValue}>
            <Text style={styles.valueText}>
              {parseFloat(transaction.fee / 1000000).toFixed(3)}{' '}
              {transaction.feeSymbol}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <View style={styles.infoValue}>
            <Text style={styles.valueText}>{formattedTime}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Round</Text>
          <View style={styles.infoValue}>
            <Text style={styles.valueText}>{transaction.round}</Text>
          </View>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Transaction ID</Text>
          <View style={styles.infoValueFull}>
            <Text
              style={[styles.valueText, styles.valueTextFull]}
              numberOfLines={1}>
              {transaction.id}
            </Text>
            <TouchableOpacity
              onPress={() => Clipboard.setString(transaction.id)}
              style={styles.copyButton}>
              <Icon
                name='copy-outline'
                style={{ color: 'rgba(66, 59, 206, 1)', fontSize: 22 }}
              />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.viewOnExplorerWrapper}>
          <Text
            onPress={() =>
              Linking.openURL(
                'https://testnet.algoexplorer.io/tx/' + transaction.id
              )
            }>
            View on explorer
          </Text>
          <Icon
            name='enter-outline'
            style={{
              color: 'rgba(66, 59, 206, 1)',
              fontSize: 21,
              marginLeft: 2,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
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
    borderBottomColor: 'rgba(4, 17, 51, 0.1)',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  infoColumn: {
    paddingVertical: 10,
    borderBottomColor: 'rgba(4, 17, 51, 0.1)',
    borderBottomWidth: 1,
    marginBottom: 10,
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
  valueTextFull: {
    textAlign: 'left',
  },
  infoValue: {
    maxWidth: 240,
  },
  positive: {
    color: '#5ECEA5',
  },
  negative: {
    color: '#FD4F64',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: { color: 'rgba(66, 59, 206, 1)', fontSize: 14, marginLeft: 3 },
  viewOnExplorerWrapper: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
})
