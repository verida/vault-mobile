import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Container, Content, List } from 'native-base';

import DataFieldList from '../../components/Data/DataFieldList';
import NavigationHeader from 'components/Navigation/NavigationHeader';


const DataItem = ({ item, folder }) => {
  const [data, setData] = useState({
    data: [],
    title: ''
  });

  useEffect(() => {
    const init = async () => {
      const data = await folder.getDetail(item);
      setData(data);
    };
    
    init();
  }, [folder, item]);

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content>
        <List>
          <DataFieldList data={data} />
        </List>
      </Content>
    </Container>
  );
};

const mapDispatchToProps = dispatch => {
  return {};
};

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DataItem);
