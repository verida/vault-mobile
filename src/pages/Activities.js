import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Icon, Content, Container } from 'native-base'

import ActivitiesList from '../components/ActivitiesList'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import StravaSvg from '../assets/icons/strava.svg'

export default () => (
  <View>
    <NavigationHeader
      title='Activities'
      right={{ icon: <Icon name='ios-add-circle' style={{ color: '#000' }} /> }}
    />
    <View style={style.itemsList}>
      <Container>
        <Content>
          <ActivitiesList list={list} />
        </Content>
      </Container>
    </View>
  </View>
)

const list = [
  {
    label: 'Afternoon Run',
    icon: <StravaSvg />,
    date: '11/10/2018',
    distance: { value: 6.42, unitOfMeasure: 'ml' },
    calories: 737,
  },
  {
    label: 'Cycling',
    icon: <StravaSvg />,
    date: '09/10/2018',
    distance: { value: 281.4, unitOfMeasure: 'km' },
    calories: 1203,
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
