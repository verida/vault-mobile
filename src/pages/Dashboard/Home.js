import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { QRCode } from 'react-native-custom-qr-codes-expo';
import Constants from 'expo-constants';
import { connect } from 'react-redux';

import Text from '../../components/Text';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { Container, Content } from 'native-base';

import EnvelopeSvg from '../../assets/icons/envelope.svg';
import SettingsSvg from '../../assets/icons/settings.svg';
import { Actions } from 'react-native-router-flux';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';
import { BLACK_COLOR_OPACITY, BLACK_ORIGIN_COLOR, WHITE_COLOR } from '../../constants/color';
import { INBOX, SETTINGS } from '../../constants/route';
import { setNewMessagesCount } from '../../store/general/actions';

import { getWallet, fetchInboxItems } from '../../api';

const UserImg = require('../../assets/stubs/user.png');
const LogoImg = require('../../assets/vault-logo.png');

const Home = (props) => {
    const [info, setInfo] = useState({});

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        fetchInboxCount();
    }, []);

    const fetchInboxCount = async () => {
        const messages = await fetchInboxItems({ read: false });
        props.setNewMessagesCount(messages.length);
    };

    const init = async () => {
        const wallet = await getWallet();
        setInfo(wallet);
    };

    return (
        <Container>
            <NavigationHeader
                left={{
                    action: () => Actions[INBOX](),
                    icon:
                    <View>
                        <EnvelopeSvg />
                        {props.newMessagesCount
                            ? <View style={style.badge}>
                                <Text style={{ fontSize: 9 }}>
                                    {props.newMessagesCount}
                                </Text>
                            </View>
                            : null
                        }
                    </View>
                }}
                right={{ action: () => Actions[SETTINGS](), icon: <SettingsSvg /> }}
            />
            <Content contentContainerStyle={style.content}>
                <Image
                    width={80}
                    height={80}
                    source={UserImg}
                    style={style.userImg} />
                <Text style={style.title}>
                    chris_were
                </Text>
                <Text style={style.text}>
                    { info.address }
                </Text>
                <View style={style.qr}>
                    <QRCode
                        logo={LogoImg}
                        logoSize={60}
                        size={207}
                        codeStyle='dot'
                        innerEyeStyle='circle'
                        padding={0.5}
                        content={info.address} />
                </View>
                <Text style={style.notes}>
                    This is your QR-Code. Present it to others so they can scan it and connect to you
                </Text>
            </Content>
        </Container>
    );
};

const mapDispatchToProps = dispatch => {
    return {
        setNewMessagesCount: data => dispatch(setNewMessagesCount(data)),
    };
};

const mapStateToProps = state => {
    return { newMessagesCount: state.newMessagesCount };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);

const marginTop = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0) + 24;
const style = StyleSheet.create ({
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    title: {
        fontSize: 22,
        lineHeight: 30,
        marginTop: 16,
        fontFamily: NUNITO_SANS_BOLD
    },
    userImg: {
        marginTop
    },
    text: {
        height: 50,
        fontSize: 14,
        marginTop: 4,
        marginBottom: 16,
        paddingHorizontal: 43,
        textAlign: 'center',
        color: BLACK_COLOR_OPACITY(0.6),
        fontFamily: NUNITO_SANS_BOLD
    },
    qr: {
        width: 240,
        height: 240,
        borderRadius: 12,
        padding: 17,
        backgroundColor: WHITE_COLOR,

        shadowColor: BLACK_ORIGIN_COLOR,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        elevation: 3
    },
    notes: {
        marginVertical: 24,
        paddingHorizontal: 43,
        textAlign: 'center',
        fontFamily: NUNITO_SANS_SEMIBOLD,
        color: BLACK_COLOR_OPACITY(0.4)
    },
    badge: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'absolute',
        right: -8,
        top: -7,
        minHeight: 15,
        minWidth: 15,
        backgroundColor: '#FF6E6E',
        borderRadius: 10,
        overflow: 'hidden'
    }
});
