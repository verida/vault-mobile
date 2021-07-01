import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/Text';
import { NUNITO_SANS_BOLD } from '../../constants/text';

const getOffsetFromNumber = (number) => {
    const result = {
        text: number,
        color: '#FD4F64'
    };
    if(number > 0) {
        result.text = `+${result.text}`;
        result.color = '#5ECEA5';
    }
  
    return result;
};

function TokenItem(props) {
    const { item: { icon, name, symbol, balance, offset, price, balanceInUsd } } = props;
    const { text: offsetText, color: offsetColor } = getOffsetFromNumber(offset);
    
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.content}>
                <Image source={{ uri: icon }} style={styles.icon}/>
                <View style={styles.tokenInfo}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{price}</Text>
                        <Text style={[styles.priceOffset, { color: offsetColor }]}>{offsetText}</Text>
                    </View>
                </View>
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceText}>{balance} {symbol}</Text>
                    {balanceInUsd > 0 && (<Text style={styles.balanceInUsdText}>${balanceInUsd}</Text>)}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { x: 3, y: 3 },
        elevation: 2,
    },
    content: {
        backgroundColor: 'white',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E0E3EA',
        borderRadius: 4,
        padding: 10,
    },
    icon: {
        width: 60,
        height: 60,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#E0E3EA',
        borderRadius: 30,
        padding: 10,
    },
    tokenInfo: {
        flex: 1,
        justifyContent: 'space-around'
    },
    name: {
        fontSize: 16,
        fontFamily: NUNITO_SANS_BOLD
    },
    priceContainer: {
        flexDirection: 'row',
  
    },
    priceText: {
        fontSize: 13,
        color: '#041133',
        opacity: 0.6,
        marginRight: 5
    },
    priceOffset: {
        fontSize: 13,
    },
    balanceContainer: {
        justifyContent: 'space-around',
        alignItems: 'flex-end'
    },
    balanceText: {
        fontSize: 16,
        fontFamily: NUNITO_SANS_BOLD
    },
    balanceInUsdText: {
        fontSize: 13,
        color: '#041133',
        opacity: 0.6,
    }
});

export default TokenItem;
