import React, { useState } from "react";
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Container, Content } from 'native-base'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CustomFooter from 'components/Layouts/CustomFooter'
import Button from 'components/Button'
import { FlatList, ListRenderItemInfo, StyleSheet, TextInput, View } from "react-native";
import { GREY_COLOR, LIGHTGREY_COLOR } from 'constants/color'
import AntDesign from 'react-native-vector-icons/AntDesign'
import LogoSvg from 'assets/icons/house.svg'
import Text from 'components/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import ShareableDataItem, { ShareableDataItemType } from "pages/Inbox/ShareableDataItem";

function ShareableData(props: NativeStackScreenProps<any>) {
  const { navigation } = props
  const [data, setData] = useState([])

  function renderItem(info: ListRenderItemInfo<ShareableDataItemType>) {
    const {item} = info
    return <ShareableDataItem />
  }

  return (
    <Container>
      <NavigationHeader title='Select an item' />
      <View style={styles.searchInputContainer}>
        <AntDesign name='search1' size={15} color={GREY_COLOR} />
        <TextInput style={styles.searchInput} placeholder={'Search'} />
      </View>
      <Content>
        <FlatList<ShareableDataItemType> data={data} renderItem={renderItem}/>
      </Content>
      <CustomFooter>
        <Button color='primary' onPress={() => {}}>
          Confirm selection
        </Button>
      </CustomFooter>
    </Container>
  )
}

const styles = StyleSheet.create({
  searchInputContainer: {
    borderRadius: 10,
    backgroundColor: LIGHTGREY_COLOR,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
})

export default ShareableData
