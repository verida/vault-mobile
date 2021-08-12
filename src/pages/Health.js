import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'native-base';

import HealthList from '../components/HealthList';
import NavigationHeader from 'components/Navigation/NavigationHeader';

import MeasurementsSvg from '../assets/icons/health/measurements.svg';
import ActivitiesSvg from '../assets/icons/health/activities.svg';
import ResultsSvg from '../assets/icons/health/results.svg';
import NotesSvg from '../assets/icons/health/notes.svg';

import {
    MEASUREMENTS,
    ACTIVITIES,
    RESULTS,
    NOTES
} from '../constants/route';

export default () => (
    <View>
        <NavigationHeader title="Health" right={{ icon: <Icon name='ios-add-circle' style={{ color: '#000' }} /> }} />
        <View style={style.itemsList}>
            <HealthList list={list} />
        </View>
    </View>
);

const list = [
    { label: 'Measurements', icon: <MeasurementsSvg />, onPress: () => {} },
    { label: 'Activities', icon: <ActivitiesSvg />, onPress: () => {} },
    { label: 'Results', icon: <ResultsSvg />, onPress: () => {} },
    { label: 'Notes', icon: <NotesSvg />, onPress: () => {} },
];

const style = StyleSheet.create({
    itemsList: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});
