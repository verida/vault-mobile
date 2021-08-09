import React from 'react';
import { View } from 'react-native';
import { Container, Content } from 'native-base';

import PropertyList from '../../components/PropertyList';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import EarthSvg from '../../assets/icons/earth.svg';
import LockSvg from '../../assets/icons/lock.svg';

import LayoutStyle from '../../styles/layouts';

import {
    PRIVATE_PROFILE,
    PUBLIC_PROFILE
} from '../../constants/route';

export default () => (
    <Container>
        <NavigationHeader left = {{ icon: 'skip' }} title="Profiles" />
        <Content>
            <View style={LayoutStyle.layout}>
                <PropertyList list={list} />
            </View>
        </Content>
    </Container>
);

const list = [
    { label: 'Public Profile', icon: <EarthSvg />, action: 'arrow', onPress: () => {}, optional: true },
    { label: 'Private Identity', icon: <LockSvg />, action: 'arrow', onPress: () => {}, optional: true }
];
