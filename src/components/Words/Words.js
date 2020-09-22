import React from 'react';
import Text from '../Text';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color';

export default ({ words, template, onSelect, id, containerStyle }) => words.map(word => (
    <TouchableOpacity key={`${id} - ${word}`}
        style={[style.word, containerStyle, template.includes(word) && style.selected]} onPress={() => onSelect(word)}>
        <Text style={template.includes(word) && style.selectedText}>{ word }</Text>
    </TouchableOpacity>
));

const style = StyleSheet.create ({
    word: {
        borderWidth: 1,
        borderColor: LIGHTGREY_COLOR,
        borderRadius: 4,
        paddingVertical: 3,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        marginBottom: 10,
        flexShrink: 1
    },
    selected: {
        backgroundColor: BLACK_COLOR_OPACITY(0.05),
        borderColor: BLACK_COLOR_OPACITY(0),
        opacity: 0.5
    },
    selectedText: {
        color: BLACK_COLOR_OPACITY(0.5)
    }
});
