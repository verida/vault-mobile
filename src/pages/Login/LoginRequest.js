import React, { useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Icon, Button as NButton } from 'native-base';
import { Container, Content } from 'native-base';

import StravaLogo from '../../assets/strava-logo.svg';
import MobileSvg from '../../assets/mobile.svg';

import Text from '../../components/Text';
import Button from '../../components/Button';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

import { Actions } from 'react-native-router-flux';
import { LOGIN_HISTORY } from '../../constants/route';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';
import { BLACK_COLOR_OPACITY } from '../../constants/color';

const approve = () => {
    Actions[LOGIN_HISTORY]();
};

const deny = () => {
    Actions[LOGIN_HISTORY]();
};

export default (props) => {
    const [isModalVisible, setModalVisibility] = useState(!props.verified);

    const color = props.verified ? '#37D5C7' : '#EF7936';
    const iconName = props.verified ? 'check' : 'exclamationcircleo';

    return (
        <Container>
            <NavigationHeader title="Login Request" />
            <Content>
                <View style={style.container}>
                    <View style={{ alignItems: 'center' }}>
                        <StravaLogo />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={[style.text, { fontSize: 12, color }]}>
                                <Icon type="AntDesign" name={iconName} style={[style.text, { color }]} />
                                {props.verified ? null : '\u00A0Not'}
                                {'\u00A0Verified'}
                            </Text>
                        </View>
                        <MobileSvg style={style.img} />
                        <Text style={style.title}>New Login Request</Text>
                        <View>
                            <Text style={style.text}>
                                There is a new login approval request from
                            </Text>
                            <Text style={[style.text, style.link]}
                                onPress={() => Linking.openURL('http://www.strava.com/')}>
                            http://www.strava.com/
                            </Text>
                        </View>
                        <Text style={style.text}>
                            25 May, 2020 at 2:53 pm
                        </Text>
                        <Text style={[style.text, style.timeout]}>
                            Expires in 90 seconds
                        </Text>
                    </View>

                    {
                        isModalVisible
                            ? (<View style={style.modal}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={[style.text, { color }]}>
                                        <Icon type='AntDesign' name='exclamationcircleo' style={[style.text, { color }]} />
                                        {' Security Warning'}
                                    </Text>
                                    <NButton transparent style={{ position: 'absolute', right: 0 }} onPress={() => setModalVisibility(!isModalVisible)}>
                                        <Icon type='AntDesign' name='close' style={{ color: '#000', fontSize: 17 }} />
                                    </NButton>
                                </View>
                                <Text style={[style.text, { textAlign: 'left', fontSize: 12 }]}>Website could not be verified and is untrusted.</Text>
                            </View>)
                            : null
                    }

                    <View style={style.actions}>
                        <Button style={[style.btn, style.mr]} onPress={approve}>Login</Button>
                        <Button style={style.btn} color="grey" onPress={deny}>Ignore</Button>
                    </View>
                </View>
            </Content>
        </Container>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        marginVertical: 20,
        marginHorizontal: 20
    },
    img: {
        marginTop: 20,
        marginBottom: 20
    },
    title: {
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 22,
        marginVertical: 4,
        textAlign: 'center'
    },
    text: {
        fontFamily: NUNITO_SANS_SEMIBOLD,
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 8
    },
    timeout: {
        fontSize: 12,
        color: BLACK_COLOR_OPACITY(0.6)
    },
    link: {
        color: 'blue'
    },
    actions: {
        marginTop: 20,
        flexDirection: 'row',
    },
    btn: {
        flex: 1,
        height: 40
    },
    mr: {
        marginRight: 20
    },
    modal: {
        backgroundColor: '#FDF4EA',
        paddingLeft: 15,
        marginTop: 10,
        width: '100%',
        borderRadius: 5
    }
});
