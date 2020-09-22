import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Text, Right, Left } from 'native-base';

import RightArrowSvg from '../../assets/icons/data/right-arrow.svg';

export default ({ item }) => {
    return (
        <ListItem button onPress={item.onPress} style={style.listItem}>
            <Left>
                { item.icon }
                <Text style={{ paddingLeft: 10 }}>{item.label}</Text>
            </Left>
            <Right>
                <RightArrowSvg />
            </Right>
        </ListItem>
    );
};

const style = StyleSheet.create({
    listItem: {
        borderBottomWidth: 0,
        minHeight: 64
    }
});
