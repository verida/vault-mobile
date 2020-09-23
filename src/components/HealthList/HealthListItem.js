import React from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';

export default ({ item }) => {
    return (
        <TouchableWithoutFeedback onPress={item.onPress}>
            <View style={style.cardItem}>
                <View>{ item.icon }</View>
                <Text style={{ paddingTop: 10, color: '#fff' }}>{item.label}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
};

const style = StyleSheet.create({
    cardItem: {
        margin: 15,
        padding: 16,
        width: 165,
        height: 112,
        borderRadius: 12,
        backgroundColor: '#FD4F64',
    }
});
