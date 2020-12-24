import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, CardItem, Body, Text, Right, Left } from 'native-base';
import moment from 'moment'
import StravaSvg from '../../../assets/icons/strava.svg';
import { stubFalse } from 'lodash';
import { preventAutoHide } from 'expo-splash-screen';

export default ({ item, folder }) => {

    // Indexes aren't being created... broken on web as well?

    // todo, set name from layout / schema displayName
    const date = moment(item.createdAt).format('DD MMM YYYY')
    const label = item.displayName | item.name
    const subText = 'hello world'

    return (
        <Card style={style.cardItem}>
            <CardItem button onPress={item.onPress} style={{ borderRadius: 4 }}>
                <Left style={style.left}>
                    <StravaSvg/>
                    <Body style={{marginLeft: 15}}>
                        <Text>{ label }</Text>
                        <Text note style={style.subText}>{ subText }</Text>
                    </Body>
                </Left>
                <Right style={style.right}>
                    <Text note style={style.date}>{ date }</Text>
                </Right>
            </CardItem>
        </Card>
    );
};

const style = StyleSheet.create({
    cardItem: {
        width: '100%',
        borderRadius: 4
    },
    left: {
        flex: 1,
        marginRight: 10
    },
    subText: {
        fontSize: 14,
        marginTop: 5
    },
    date: {
        fontSize: 12
    },
    right: {
        height: '100%',
        flex: -1
    }
});
