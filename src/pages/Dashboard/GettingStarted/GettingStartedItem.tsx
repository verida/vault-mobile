import { NavigationProp, useNavigation } from '@react-navigation/native'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { GREY_COLOR, TEXT_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { MainStackParams } from 'navigation/types'

export interface GettingStartedItemProps {
  label: string
  screen: any
  icon: React.ReactElement
}

const GettingStartedItem = (props: GettingStartedItemProps) => {
  const { icon, screen, label } = props
  const navigation = useNavigation<NavigationProp<MainStackParams>>()

  const handlePress = () => {
    navigation.navigate(screen)
  }

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.details}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View>
        <AntDesign name={'right'} size={15} color={GREY_COLOR} />
      </View>
    </Pressable>
  )
}

export default GettingStartedItem

const styles = StyleSheet.create({
  container: {
    boxSizing: 'border-box',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E0E3EA', // Hardcoded color
    backgroundColor: WHITE_COLOR,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: 21.82,
    fontFamily: NUNITO_SANS_BOLD,
    marginLeft: 8,
    color: TEXT_COLOR,
  },
})
