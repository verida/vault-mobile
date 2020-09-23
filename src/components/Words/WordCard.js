import React from 'react';
import { StyleSheet } from 'react-native';

import Text from '../Text';
import { LIGHTGREY_COLOR } from '../../constants/color';

export default ({ words }) => (<Text style={style.words} selectable>{ words }</Text>);

const style = StyleSheet.create ({
    words: {
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        paddingTop: 16,
        padding: 16,
        textAlign: 'center'
    }
});
