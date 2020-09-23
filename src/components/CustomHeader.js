import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Text, Button, Icon } from 'native-base';

export default ({ leftButton = { icon: 'arrow-back', action: Actions.pop }, rightButton = {}, title }) => (
    <View style={style.navigation}>
        <Button transparent onPress={leftButton.action}>
            <Icon name={leftButton.icon} style={{ color: '#000' }} />
        </Button>
        <Text style={style.title}>{title}</Text>
        <Button transparent onPress={rightButton.action}>
            <Icon name={rightButton.icon} style={{ color: '#000' }} />
        </Button>
    </View>
);

const style = StyleSheet.create({
    navigation: {
        paddingTop: 45,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap', alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#D3D3D3'
    },
    title: {
        fontSize: 17,
        fontWeight: '700'
    }
});
