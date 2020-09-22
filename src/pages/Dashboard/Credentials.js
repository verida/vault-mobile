import React from 'react';
import { Container, Content } from 'native-base';

import Search from '../../components/Search';
import CredentialList from '../../components/CredentialList';
import NavigationHeader from '../../components/Navigation/NavigationHeader';

export default () => (
    <Container>
        <NavigationHeader title="Credentials" />
        <Content contentContainerStyle={{ paddingHorizontal: 20 }}>
            <Search/>
            <CredentialList />
        </Content>
    </Container>
);
