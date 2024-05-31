import Clipboard from '@react-native-community/clipboard'
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  StyleProp,
  StyleSheet,
  Switch,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import Snackbar from 'react-native-snackbar'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Text from '~/components/Text'
import { BLACK_COLOR_OPACITY, SUCCESS_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'

export interface PropertyListItemProps {
  styles: Record<string, StyleProp<ViewStyle & TextStyle>>
  item: Record<string, any>
}

export const PropertyListItem: React.FC<PropertyListItemProps> = ({
  styles,
  item,
}) => {
  const [option, setOption] = useState<boolean>(false)
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={styles.external}
      onPress={() => {
        if (item.action === 'copy') {
          Clipboard.setString(item.value)
          Snackbar.show({
            text: 'Copied',
            duration: Snackbar.LENGTH_SHORT,
          })
        } else {
          item.onPress?.(navigation)
        }
      }}>
      <View style={styles.internal}>
        <View style={style.section}>
          {item.icon && <View style={style.icon}>{item.icon}</View>}
          <Text style={[style.text, styles.text]}>{item.label}</Text>
        </View>
        <View style={[style.section, style.alignRight]}>
          {!item.optional && (
            <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={[style.text, style.value]}>
              {item.value || 'Not set'}
            </Text>
          )}
          {item.custom}
          <View style={{ marginRight: 16 }}>
            {item.action === 'arrow' && (
              <Icon
                size={22}
                name='keyboard-arrow-right'
                color={BLACK_COLOR_OPACITY(0.45)}
              />
            )}
            {item.action === 'switch' && (
              <Switch
                trackColor={{ false: '#767577', true: SUCCESS_COLOR }}
                ios_backgroundColor='#3e3e3e'
                onValueChange={setOption}
                value={option}
              />
            )}
            {item.action === 'copy' && (
              <Icon
                size={22}
                name='content-copy'
                color={BLACK_COLOR_OPACITY(0.45)}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 17,
    flexShrink: 1,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 18,
  },
  alignRight: {
    paddingLeft: 32,
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  value: {
    marginRight: 25,
    color: BLACK_COLOR_OPACITY(0.6),
  },
})
