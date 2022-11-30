import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import NFTIcon from 'assets/nft.svg'
import Button from 'components/Button'
import { NUNITO_SANS_BOLD } from 'constants/text'

import { ConnectionList } from './BadgeList'

type BadgeItemProps = {
  item: ConnectionList
  buttonLabel: string
  onPress?: () => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({
  item,
  onPress,
  buttonLabel,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <NFTIcon />
        {/* <Image source={item.icon} /> */}
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item?.connection}</Text>
          <Text style={styles.subText}>{item?.status}</Text>
        </View>
      </View>
      <View>
        <Button
          style={{
            borderRadius: 70,
            paddingHorizontal: 15,
            paddingVertical: 4,
            width: '100%',
          }}
          color='primary'
          disabled={false}
          loading={false}
          onPress={onPress}>
          {buttonLabel}
        </Button>
      </View>
    </View>
  )
}

export default BadgeItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeIcon: {},
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  textWrapper: {
    marginHorizontal: 16,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    fontSize: 16,
    color: '#041133',
  },
  subText: {
    fontFamily: NUNITO_SANS_BOLD,
    fontWeight: '600',
    fontSize: 12,
    color: '#041133',
  },
  actionButton: {},
})
