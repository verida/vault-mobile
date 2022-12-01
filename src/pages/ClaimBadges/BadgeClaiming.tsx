import React, { useState } from 'react'
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import EthereumIcon from 'assets/networks/ethereum2.svg'
import AddressesListItem from 'components/AddressesList/AddressesListItem'
import AppAlert from 'components/AppAlert/AppAlert'
import Button from 'components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { LIGHTGREY_COLOR, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import ClaimBadgeStatus from './ClaimBadgeStatus'

const VeridaIdentity = require('assets/badges_icon/verida_identity.png')

const alertDesc = `Verida Badge is a public and immutable token sent to your blockchain address. It will appear on your Verida One public profile by default.`

const mockAddressItem = {
  name: 'Main address 1',
  address: '0xdbcf...67bd',
  amount: '0.0022 ETH',
  icon: <EthereumIcon />,
}

type Status = 'error' | 'success' | undefined

const BadgeClaiming = () => {
  const [status] = useState<Status>()

  const claimBadgeCard = (
    <ScrollView style={styles.content}>
      <View style={styles.imageContainer}>
        <Image source={VeridaIdentity} />
      </View>
      <View>
        <Text style={styles.title}>Verida Identity Badge</Text>
        <Text style={styles.bodyText}>
          Your Badge will include your Verida DID as proof of ownership:
          vda:0xD11B3...00cE
        </Text>
      </View>
      <View style={styles.addressSection}>
        <Text style={styles.addressTitle}>Select address</Text>
        <AddressesListItem
          customStyles={styles.addressList}
          item={mockAddressItem}
        />
      </View>
      <View style={styles.alertSection}>
        <AppAlert body={alertDesc} type='warning' />
      </View>
    </ScrollView>
  )

  const TransactionSection = (
    <View style={styles.transactionSection}>
      <View style={styles.transactionContent}>
        <Text style={styles.trxnText}>Estimated gas fee </Text>
        <Text style={styles.trxnText}>≈ 0.001 ETH (1.55 USD)</Text>
      </View>
      <Button
        style={styles.actionButton}
        color='primary'
        disabled={false}
        loading={false}>
        Claim
      </Button>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader title='Verida Identity Badge' left={{ icon: 'back' }} />
      {status && (
        <View style={styles.content}>
          <ClaimBadgeStatus type={status} />
        </View>
      )}
      {!status && claimBadgeCard}
      {!status && TransactionSection}
    </SafeAreaView>
  )
}

export default BadgeClaiming

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE_COLOR,
  },
  imageContainer: {
    marginTop: 15.5,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginHorizontal: 16,
  },
  addressSection: {
    marginVertical: 24,
  },
  alertSection: {
    marginBottom: 24,
  },
  transactionSection: {
    borderColor: LIGHTGREY_COLOR,
    borderTopWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowColor: `0px 4px 24px rgba(0, 0, 0, 0.04)`,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 50,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  trxnText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    color: '#808695',
  },
  addressTitle: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  title: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '600',
    fontSize: 22,
    textAlign: 'justify',
    color: TEXT_COLOR,
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 12,
    color: '#808695',
    marginBottom: 16,
  },
  addressList: {
    elevation: 4,
    borderColor: LIGHTGREY_COLOR,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowColor: `0px 4px 24px rgba(0, 0, 0, 0.04)`,
  },
  actionButton: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
})
