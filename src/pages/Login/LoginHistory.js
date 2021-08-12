import React, { useState } from 'react';
import { Container, Icon } from 'native-base';
import { SceneMap, TabView } from 'react-native-tab-view';

import HistoryLayout from '../../components/Layouts/HistoryLayout';
import LoginTabs from '../../components/Navigation/LoginTabs';
import NavigationHeader from 'components/Navigation/NavigationHeader';

export default (props) => {
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
          action: () => props.navigation.goBack()
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
