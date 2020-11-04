import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode';
import { Actions } from 'react-native-router-flux';

import { SUCCESS } from '../../constants/route';
import { BLACK_ORIGIN_COLOR } from '../../constants/color';

export default () => {
    const [loading, setLoading] = useState(true);

    const init = async () => {
        const status = await hasUserSetPinCode();
        if (status) return Actions[SUCCESS]();
        setLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading </Text>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <PINCode
            status={'choose'}
            finishProcess={() => Actions[SUCCESS]()}
            colorCircleButtons="#dfe1e8"
            stylePinCodeColorTitle={BLACK_ORIGIN_COLOR}
            stylePinCodeColorSubtitle={BLACK_ORIGIN_COLOR}
            stylePinCodeButtonNumber={BLACK_ORIGIN_COLOR}
            stylePinCodeDeleteButtonSize={45}
            stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center'
    }
});
