import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataFieldList from '../../components/Data/DataFieldList'
import NavigationHeader from 'components/Navigation/NavigationHeader'

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })

  useEffect(() => {
    const init = async () => {
      const _data = await folder.getDetail(item)
      setData(_data)
    }

    init()
  }, [folder, item])

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content>
        <List>
          <DataFieldList data={data} />
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

export default connect(mapStateToProps, mapDispatchToProps)(DataItem)
