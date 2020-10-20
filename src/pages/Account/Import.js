import React from 'react';
import { View } from 'react-native';

import AccountInit from '../../components/AccountInit';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { SELECT_NETWORK } from '../../constants/route';

export default () => (
    <View>
        <NavigationHeader title="Import An Account" />
        <AccountInit action={SELECT_NETWORK} />
    </View>
);
