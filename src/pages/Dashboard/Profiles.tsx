import { selectSelectedPublicProfile } from 'features/profiles'
import { Container, Content } from 'native-base'
import React from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'

import EarthSvg from '../../assets/icons/earth.svg'
import PropertyList from '../../components/PropertyList'
import LayoutStyle from '../../styles/layouts'

const list = [
  {
    label: 'Public Profile',
    icon: <EarthSvg />,
    action: 'arrow',
    onPress: (navigation: any) => navigation.navigate('PublicProfile'),
    optional: true,
  },
  // {
  //   label: 'Private Identity',
  //   icon: <LockSvg />,
  //   action: 'arrow',
  //   onPress: (navigation) => navigation.navigate('PrivateProfile'),
  //   optional: true,
  // },
]

const Profiles = () => {
  return (
    <Container>
      <NavigationHeader left={{ icon: 'skip' }} title='Profiles' />
      <Content>
        <View style={LayoutStyle.layout}>
          <PropertyList list={list} />
        </View>
      </Content>
    </Container>
  )
}

const mapStateToProps = (state: any) => {
  return {
    publicProfileData: selectSelectedPublicProfile(state),
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Profiles)
