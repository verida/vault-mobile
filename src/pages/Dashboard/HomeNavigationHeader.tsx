import Text from 'components/Text'
import { Header, Left, Right } from 'native-base'
import React from 'react'
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { NUNITO_SANS_BOLD } from 'constants/text'

export type HomeNavigationHeaderProps = Omit<ViewProps, 'children'> & {
  avatar: ImageSourcePropType
  name: string
  inboxCount: number
  onAvatarPress: () => void
  onNamePress: () => void
  onEmailPress: () => void
  onSettingPress: () => void
}

function HomeNavigationHeader(props: HomeNavigationHeaderProps) {
  console.log(props)
  const {
    avatar,
    name,
    inboxCount,
    onAvatarPress,
    onNamePress,
    onEmailPress,
    onSettingPress,
    ...rest
  } = props

  return (
    <Header
      transparent
      style={styles.header}
      androidStatusBarColor='light-gray'
      {...rest}>
      <Left>
        <View style={styles.left}>
          <TouchableOpacity style={styles.avatarButton} onPress={onAvatarPress}>
            <Image source={avatar} style={styles.avatar} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.nameButton} onPress={onNamePress}>
            <Text style={styles.name}>Hien Phung</Text>
            <AntDesign name={'caretdown'} size={10} color={'#041133'} />
          </TouchableOpacity>
        </View>
      </Left>
      <Right />
    </Header>
  )
}

const styles = StyleSheet.create({
  header: {
    elevation: 1,
    paddingLeft: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 18,
    marginRight: 8.4,
    fontFamily: NUNITO_SANS_BOLD,
  },
  nameButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default HomeNavigationHeader
