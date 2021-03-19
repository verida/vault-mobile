import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../assets/logo.svg';
import Texture from '../../assets/landing-bg.svg';
import { Actions } from 'react-native-router-flux';

import Button from '../../components/Button';
import Text from '../../components/Text';

import {
    CREATE_ACCOUNT,
    SEED_PHRASE_ENTERED
    //IMPORT_ACCOUNT -- use this for original import account flow
} from '../../constants/route';

import { WHITE_COLOR } from '../../constants/color';
import { NUNITO_SANS_BOLD } from '../../constants/text';

export default () => {
    const title = 'Welcome!\nIt\'s time to own your personal data.';

    const createAcc = () => (Actions[CREATE_ACCOUNT]());
    const importAcc = () => (Actions[SEED_PHRASE_ENTERED]());

    return (
        <LinearGradient
            colors={['#0E1572', '#1467CB', '#1995CB']}
            style={style.landing}>
            <Texture
                width={425}
                height={428} />
            <View style={style.positionAbsolute}>
                <View>
                    <Logo
                        width={139}
                        height={51} />
                    <Text style={style.title}>
                        {title}
                    </Text>
                </View>
                <View>
                    <Button color="secondary" onPress={createAcc}>
                        Create An Account
                    </Button>
                    <Button color="outlined" onPress={importAcc}>
                        Import An Account
                    </Button>
                </View>
            </View>
        </LinearGradient>
    );
};

const style = StyleSheet.create ({
    positionAbsolute: {
        position: 'absolute',
        paddingHorizontal: 24,
        paddingVertical: 77,
        height: '100%',
        width: '100%',
        justifyContent: 'space-between'
    },
    landing: {
        flex: 1,
    },
    title: {
        color: WHITE_COLOR,
        fontFamily: NUNITO_SANS_BOLD,
        fontSize: 36,
        marginTop: '35%'
    },
});
