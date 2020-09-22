import React from 'react';
import { Actions } from 'react-native-router-flux';
import { View, StyleSheet } from 'react-native';

import HealthList from '../components/HealthList';
import CustomHeader from '../components/CustomHeader';

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
        <CustomHeader title="Health" rightButton={{ icon: 'ios-add-circle' }} />
        <View style={style.itemsList}>
            <HealthList list={list} />
        </View>
    </View>
);

const list = [
    { label: 'Measurements', icon: <MeasurementsSvg />, onPress: () => Actions[MEASUREMENTS]() },
    { label: 'Activities', icon: <ActivitiesSvg />, onPress: () => Actions[ACTIVITIES]() },
    { label: 'Results', icon: <ResultsSvg />, onPress: () => Actions[RESULTS]() },
    { label: 'Notes', icon: <NotesSvg />, onPress: () => Actions[NOTES]() },
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
