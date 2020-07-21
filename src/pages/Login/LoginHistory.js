import React, { useState } from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';

import HistoryLayout from "../../components/Layouts/HistoryLayout";
import LoginTabs from "../../components/Navigation/LoginTabs";

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
        <TabView
            renderTabBar={props => <LoginTabs {...props} onIndexChange={setIndex} />}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
        />
    );
}
