import React, { useState } from 'react';
import { Container, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { TabView, SceneMap } from 'react-native-tab-view';

import HistoryLayout from '../../components/Layouts/HistoryLayout';
import LoginTabs from '../../components/Navigation/LoginTabs';
import NavigationHeader from '../../components/Navigation/NavigationHeader';
import { SETTINGS } from '../../constants/route';

export default () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'approved', title: 'Approved' },
        { key: 'denied', title: 'Denied' }
    ]);

    const renderScene = SceneMap({
        approved: HistoryLayout,
        denied: HistoryLayout,
    });

    return (
        <Container>
            <NavigationHeader
                title="Login History"
                left={{
                    icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
                    action: () => Actions[SETTINGS]()
                }}
            />
            <TabView
                renderTabBar={props => <LoginTabs {...props} onIndexChange={setIndex} />}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
            />
        </Container>
    );
};
