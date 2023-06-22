import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { getTruncatedWalletAddress } from 'wallet/helpers/tokens'

import { TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'

import AddressSvg from '../../assets/icons/address.svg'
import RightArrowSvg from '../../assets/icons/data/right-arrow.svg'

export default ({ item, customStyles, onPress }) => {
  if (!item.address) return null
  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, customStyles && customStyles]}>
      <View style={styles.itemWrapper}>
        <View>
          {item.icon ? (
            <Image source={{ uri: item.icon }} style={styles.icon} />
          ) : (
            <AddressSvg />
          )}
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.label}>{item.name || item.label}</Text>
          <Text style={styles.address}>{`${getTruncatedWalletAddress(
            item.address
          )}`}</Text>
          {item.amount && <Text style={styles.amount}>{`${item.amount}`}</Text>}
        </View>
      </View>
      <View>
        <RightArrowSvg />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  textWrapper: {
    marginHorizontal: 16,
  },
  label: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '700',
    fontSize: 17,
    color: TEXT_COLOR,
    marginBottom: 3,
    marginTop: 3,
  },
  icon: {
    height: 64,
    width: 64,
  },
  address: {
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  amount: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 14,
    color: TEXT_COLOR,
  },
  itemWrapper: {
    flex: 2,
    flexDirection: 'row',
  },
})
