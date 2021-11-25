import React from 'react'
import LogoSvg from 'assets/icons/house.svg'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from "react-native";
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { GREY_COLOR } from "constants/color";

export type ShareableDataItemType = {}

export type ShareableDataItemProps = Omit<TouchableOpacityProps, 'children'> & {
  item: ShareableDataItemType
}

function ShareableDataItem(props: ShareableDataItemProps) {
  return (
    <TouchableOpacity style={styles.item}>
      <LogoSvg />
      <View style={styles.itemContent}>
        <Text style={{ fontFamily: NUNITO_SANS_BOLD, fontSize: 16 }}>
          Identity
        </Text>
        <Text>Government of Western...</Text>
        <Text>May 6, 2020 11:00 am</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GREY_COLOR,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  itemContent: {
    marginLeft: 10,
  },
})

export default ShareableDataItem
