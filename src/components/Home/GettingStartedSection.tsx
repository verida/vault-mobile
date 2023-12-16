import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ConnectIcon from 'assets/icons/connect_icon.svg'
import UpdateProfileIcon from 'assets/icons/update_profile_icon.svg'
import MainWalletIcon from 'assets/icons/wallet_icon_2.svg'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS } from 'constants/text'

import GettingStartedItem, {
  GettingStartedItemProps,
} from './GettingStartedItem'

const items: GettingStartedItemProps[] = [
  {
    label: 'Update Profile',
    icon: <UpdateProfileIcon />,
    screen: 'Profiles',
  },
  {
    label: 'Connect Accounts',
    icon: <ConnectIcon />,
    screen: 'Connections',
  },
  {
    label: 'Import Address',
    icon: <MainWalletIcon />,
    screen: 'ImportAccount',
  },
]

export const GettingStarted = () => {
  return (
    <View>
      <Text style={styles.label}>What you could do next</Text>
      {items.map((item) => (
        <View key={item.label} style={styles.itemContainer}>
          <GettingStartedItem key={item.label} {...item} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    fontFamily: NUNITO_SANS,
    color: TEXT_COLOR,
  },
})
