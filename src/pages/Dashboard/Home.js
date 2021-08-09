import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { QRCode } from 'react-native-custom-qr-codes-expo';
import { connect } from 'react-redux';

import Text from '../../components/Text';
import NavigationHeader from 'components/Navigation/NavigationHeader';
import { Container, Content } from 'native-base';

import EnvelopeSvg from '../../assets/icons/envelope.svg';
import SettingsSvg from '../../assets/icons/settings.svg';
import Clipboard from '@react-native-community/clipboard';

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text';
import { BLACK_COLOR_OPACITY, BLACK_ORIGIN_COLOR, WHITE_COLOR, ORANGE_COLOR } from '../../constants/color';
import { INBOX, SETTINGS, PUBLIC_PROFILE } from '../../constants/route';
import { setNewMessagesCount } from '../../store/general/actions';

import { getWallet, getVault, loadAvatarSource } from '../../api';

const DefaultAvatar = require('../../assets/stubs/avatar.png');
const LogoImg = require('../../assets/vault-logo.png');

const Home = (props) => {
    const [info, setInfo] = useState({});
    const [avatarSource, setAvatarSource] = useState(DefaultAvatar);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        fetchInboxCount();
    }, []);

    const fetchInboxCount = async () => {
        const vault = await getVault();
        const messages = await vault.inbox.fetchLatest({ read: false });
        props.setNewMessagesCount(messages.length);
    };

    const init = async () => {
        const wallet = await getWallet();
        const vault = await getVault();
        const name = await vault.profiles.public.get('name')
        const source = await loadAvatarSource()
        setAvatarSource(source)
        
        vault.veridaApp.inbox.on('inboxChange', function(item) {
            fetchInboxCount();
        })

        vault.veridaApp.inbox.on('newMessage', function(item) {
            fetchInboxCount();
        })

        /*await vault.profiles.public.listen(function(row) {
            console.log('row changed!', row)
        })
        console.log('setup listen ing for public profile changes')*/

        setInfo({
            address: wallet.did,
            name
        });
    };

    return (
        <Container>
            <NavigationHeader
                left={{
                    action: () => {},
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
                right={{ action: () => {}, icon: <SettingsSvg /> }}
            />
            <Content contentContainerStyle={style.content}>
                <TouchableOpacity onPress={() => {}}>
                    <Image
                        source={avatarSource}
                        style={style.userImg} />
                </TouchableOpacity>
                <Text style={style.title} onPress={() => {}}>
                    { info.name }
                </Text>
                <Text style={style.text} onPress={() => Clipboard.setString(info.address)}>
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
                <Text style={style.network}>Testnet</Text>
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

//const marginTop = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0) + 24;
const marginTop = 0;
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
        width: 80,
        height: 80,
        borderRadius: 60,
        borderColor: WHITE_COLOR,
        borderWidth: 4,
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
    },
    network: {
        backgroundColor: ORANGE_COLOR,
        color: WHITE_COLOR,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 5,
        paddingBottom: 5,
        marginTop: 10,
        borderRadius: 10
    }
});
