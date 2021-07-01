import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { PRIMARY_COLOR } from '../../constants/color';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { Container, Content } from 'native-base';
import Text from '../../components/Text';
import { NUNITO_SANS_BOLD } from '../../constants/text';
import ActionButton, { ActionButtonType } from './ActionButton';
import TokenItem from './TokenItem';

const tokensData = [
    {
        icon: 'https://download.logo.wine/logo/Ethereum/Ethereum-Logo.wine.png',
        name: 'Ethereum',
        symbol: 'ETH',
        balance: 1.0934,
        offset: 16.44,
        price: 1414.12,
        balanceInUsd: 2428.3
    },
    {
        icon: 'https://s3-us-west-1.amazonaws.com/compliance-ico-af-us-west-1/production/token_profiles/logos/original/9d5/c43/cc-/9d5c43cc-e232-4267-aa8a-8c654a55db2d-1608222929-b90bbe4696613e2faeb17d48ac3aa7ba6a83674a.png',
        name: 'Near Protocol',
        symbol: 'NEAR',
        balance: 67.03,
        offset: -2.15,
        price: 2.39,
        balanceInUsd: 160.2
    },
    {
        icon: 'https://res.cloudinary.com/apideck/image/upload/w_200,f_auto/v1623343864/icons/verida-io.png',
        name: 'Verida',
        symbol: 'VDA',
        balance: 0,
        offset: -2.22,
        price: 0.59,
        balanceInUsd: 0
    }
];

function Tokens(props) {
    const {} = props;
	
    const renderItem = useCallback(({ item }) => {
        console.log('item:', item);
        return (
            <TokenItem item={item}/>
        );
    }, []);
    
    const renderSeparator = () => (
        <View style={styles.itemSeparator}/>
    );
    
    return (
        <Container>
            <NavigationHeader left = {{ icon: 'skip' }} title="Tokens" />
            <Content scrollEnabled={false}>
                <View style={styles.headerContainer}>
                    <Text style={styles.totalBalanceValue}>$3,160</Text>
                    <Text style={styles.totalBalanceLabel}>Total Balance</Text>
    
                    <View style={styles.headerButtonsContainer}>
                        <ActionButton type={ActionButtonType.SEND}/>
                        <ActionButton type={ActionButtonType.RECEIVE} style={styles.receiveButton}/>
                        <ActionButton type={ActionButtonType.TOPUP}/>
                    </View>
                </View>
                <FlatList contentContainerStyle={styles.container}
                    data={tokensData}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderSeparator}
                />
            </Content>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        paddingBottom: 20
    },
    headerContainer: {
        paddingVertical: 30,
        paddingHorizontal: '15%',
        backgroundColor: PRIMARY_COLOR,
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
        marginHorizontal: 15
    },
    totalBalanceValue: {
        color: 'white',
        fontSize: 24,
        fontFamily: NUNITO_SANS_BOLD,
        marginBottom: 5,
    },
    totalBalanceLabel: {
        color: 'white',
        opacity: 0.8
    },
    headerButtonsContainer: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30
    },
    itemSeparator: {
        height: 10
    }
});

export default Tokens;
