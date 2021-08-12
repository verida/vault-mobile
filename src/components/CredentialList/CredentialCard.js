import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Text from '../Text';
import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color';
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';

const onPress = (credential) => {
  // Actions[CREDENTIAL_DETAILS]({ credential });
};

export default ({ item, active, ...props }) => (
  <TouchableOpacity style={[style.card, props.style]} onPress={() => active && onPress(item)}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={{ uri: item.logo }} style={style.img}/>
      <View>
        <Text style={style.title}>{ item.title }</Text>
        <Text style={style.text}>{ item.description }</Text>
        <Text style={style.text}>{ item.createdAt }</Text>
      </View>
    </View>
    { active && <Icon
      size={22}
      name="keyboard-arrow-right"
      color={BLACK_COLOR_OPACITY(0.45)} /> }
  </TouchableOpacity>
);

const style = StyleSheet.create ({
  card: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
    marginBottom: 3
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 13
  },
  img: {
    width: 60,
    height: 60,
    marginRight: 16
  }
});
