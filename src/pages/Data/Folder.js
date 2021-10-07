import React, { useEffect, useState } from 'react'
import { Container, Content } from 'native-base'
import { connect } from 'react-redux'

import DataCardView from '../../components/Data/CardView'
import DataListView from '../../components/Data/ListView'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { getVault } from '../../api'
import * as Sentry from '@sentry/react-native'

const Folder = (props) => {
  const { route } = props
  const [folder, setFolder] = useState()

  useEffect(() => {
    const init = async () => {
      try {
        const { folderName } = route.params.folderName
        const vault = await getVault()
        const _folder = await vault.data.selectFolder(folderName)
        setFolder(_folder)
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    init()
  }, [route.params.folderName])

  return (
    <Container>
      <NavigationHeader
        title={folder ? folder.config.titlePlural || folder.config.title : ''}
      />
      {folder ? (
        <Content>
          {folder.config.display === 'folders'
            ? React.createElement(DataCardView, { folder })
            : React.createElement(DataListView, { folder })}
        </Content>
      ) : null}
    </Container>
  )
}

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Folder)
