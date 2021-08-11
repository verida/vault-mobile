import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataList from '../../components/DataList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { getVault } from '../../api'
import { useNavigation } from '@react-navigation/native'

const Folders = () => {
  const navigationProp = useNavigation()
  const [list, setList] = useState([])

  useEffect(() => {
    const init = async () => {
      const vault = await getVault()
      const { navigation, folders } = vault.data.map

      const items = navigation.map((folder) => {
        if (!folders[folder]) {
          // folder doesn't exist
          console.error(
            `${folder} is listed in navigation, but not defined in map.json`
          )
          return
        }

        const { title, titlePlural, icon } = folders[folder]

        return {
          label: titlePlural || title,
          icon: icon,
          onPress: () => {
            console.log('Pressed on:', title)
            navigationProp.navigate('DataFolder', { folderName: folder })
          },
        }
      })

      setList(items)
    }

    init()
  }, [navigationProp])

  return (
    <Container>
      <NavigationHeader left={{ icon: 'skip' }} title='Data' />
      <Content>
        <List>
          <DataList list={list} />
        </List>
      </Content>
    </Container>
  )
}

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Folders)
