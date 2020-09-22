import React from 'react';
import { View } from 'react-native';

import AccountInit from '../../components/AccountInit';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { SEED_PHRASE } from '../../constants/route';

export default () => (
    <View>
        <NavigationHeader title="Create An Account" />
        <AccountInit action={SEED_PHRASE} />
    </View>
);
