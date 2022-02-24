import { Icon } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import NavigationHeader from 'components/Navigation/NavigationHeader'

import ActivitiesSvg from '../assets/icons/health/activities.svg'
import MeasurementsSvg from '../assets/icons/health/measurements.svg'
import NotesSvg from '../assets/icons/health/notes.svg'
import ResultsSvg from '../assets/icons/health/results.svg'
import HealthList from '../components/HealthList'

export default () => (
  <View>
    <NavigationHeader
      title='Health'
      right={{ icon: <Icon name='ios-add-circle' style={{ color: '#000' }} /> }}
    />
    <View style={style.itemsList}>
      <HealthList list={list} />
    </View>
  </View>
)

const list = [
  {
    label: 'Measurements',
    icon: <MeasurementsSvg />,
    onPress: (navigation) => navigation.navigate('HealthMeasurements'),
  },
  {
    label: 'Activities',
    icon: <ActivitiesSvg />,
    onPress: (navigation) => navigation.navigate('HealthActivities'),
  },
  {
    label: 'Results',
    icon: <ResultsSvg />,
    onPress: (navigation) => navigation.navigate('HealthResults'),
  },
  {
    label: 'Notes',
    icon: <NotesSvg />,
    onPress: (navigation) => navigation.navigate('HealthNotes'),
  },
]

const style = StyleSheet.create({
  itemsList: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
