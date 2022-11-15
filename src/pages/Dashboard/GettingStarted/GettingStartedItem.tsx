import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { GREY_COLOR, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

type GettingStartedItemProps = {
  title: string
  screen: any
  icon: React.ReactElement
}

const GettingStartedItem = ({
  icon,
  screen,
  title,
}: GettingStartedItemProps) => {
  const navigation = useNavigation()

  const handleOnPress = () => {
    navigation.navigate(screen)
  }
  return (
    <Pressable style={styles.container} onPress={handleOnPress}>
      <View style={styles.cardDetails}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardIcon}>
        <AntDesign name={'right'} size={15} color={GREY_COLOR} />
      </View>
    </Pressable>
  )
}

export default GettingStartedItem

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    width: 343,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E0E3EA',
    backgroundColor: WHITE_COLOR,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 15,
  },
  sideText: {},
  cardTitle: {
    fontSize: 16,
    fontFamily: NUNITO_SANS_BOLD,
    marginLeft: 8,
    color: TEXT_COLOR,
  },
  cardIcon: {
    marginRight: 22,
  },
})
