import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import Button from 'components/Button'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'
import { BadgeType } from 'utils/types/badges'

type BadgeItemProps = {
  item: BadgeType
  onPress: (arg: BadgeType) => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({ item, onPress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image style={styles.badgeIcon} source={item.image} />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.subText}>{item.name || 'not connected'}</Text>
        </View>
      </View>
      <View>
        {item.name ? (
          <Button
            style={styles.actionButton}
            color='primary'
            disabled={false}
            loading={false}
            onPress={() => {
              onPress(item)
            }}>
            Claim
          </Button>
        ) : (
          <Button
            style={styles.actionButton}
            color='light-primary'
            disabled={false}
            loading={false}
            onPress={() => {
              navigation.navigate('SingleConnection', {
                provider: item.name as string,
              })
            }}>
            Connect
          </Button>
        )}
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
  badgeIcon: {
    height: 43,
    width: 43,
  },
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
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '600',
    fontSize: 16,
    color: TEXT_COLOR,
  },
  subText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '600',
    fontSize: 12,
    color: TEXT_COLOR,
  },
  actionButton: {
    height: 32,
    borderRadius: 70,
    paddingHorizontal: 12,
  },
})
