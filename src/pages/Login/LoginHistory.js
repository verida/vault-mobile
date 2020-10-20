import React, { useState } from 'react';
import { Container } from 'native-base';
import { TabView, SceneMap } from 'react-native-tab-view';

import HistoryLayout from '../../components/Layouts/HistoryLayout';
import LoginTabs from '../../components/Navigation/LoginTabs';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

export default () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'pending', title: 'Pending' },
        { key: 'approved', title: 'Approved' },
        { key: 'denied', title: 'Denied' }
    ]);

    const renderScene = SceneMap({
        pending: HistoryLayout,
        approved: HistoryLayout,
        denied: HistoryLayout,
    });

    return (
        <Container>
            <NavigationHeader title="Login History" />
            <TabView
                renderTabBar={props => <LoginTabs {...props} onIndexChange={setIndex} />}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
            />
        </Container>
    );
};
