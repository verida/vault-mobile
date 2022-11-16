import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ConnectIcon from 'assets/icons/connect_icon.svg'
import UpdateProfileIcon from 'assets/icons/update_profile_icon.svg'
import MainWalletIcon from 'assets/icons/wallet_icon_2.svg'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS } from 'constants/text'

import GettingStartedItem from './GettingStartedItem'

const dataList = [
  {
    title: 'Update Profile',
    icon: <UpdateProfileIcon />,
    screen: 'Profiles',
  },
  {
    title: 'Connect Accounts',
    icon: <ConnectIcon />,
    screen: 'Connections',
  },
  {
    title: 'Import Address',
    icon: <MainWalletIcon />,
    screen: 'ImportAccount',
  },
]

const GettingStartedSection = () => {
  return (
    <>
      <Text style={styles.listTitle}>What you could do next</Text>
      {dataList.map((item) => (
        <View
          key={item.title}
          style={{
            marginTop: 8,
          }}>
          <GettingStartedItem {...item} />
        </View>
      ))}
    </>
  )
}

export default GettingStartedSection

const styles = StyleSheet.create({
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS,
    color: TEXT_COLOR,
  },
})
