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
import EnvelopeSvg from 'assets/icons/envelope.svg'
import SettingsSvg from 'assets/icons/settings.svg'

export type HomeNavigationHeaderProps = Omit<ViewProps, 'children'> & {
  avatar: ImageSourcePropType
  name: string
  inboxCount: number
  onAvatarPress: () => void
  onNamePress: () => void
  onInboxPress: () => void
  onSettingsPress: () => void
}

const MAX_MESSAGE_COUNT = 21
const HITSLOP = { top: 10, right: 10, bottom: 10, left: 10 }

function HomeNavigationHeader(props: HomeNavigationHeaderProps) {
  const {
    avatar,
    name,
    inboxCount,
    onAvatarPress,
    onNamePress,
    onInboxPress,
    onSettingsPress,
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
          <View>
            <TouchableOpacity style={styles.nameButton} onPress={onNamePress}>
              <Text style={styles.name}>{name}</Text>
              <AntDesign name={'caretdown'} size={10} color={'#041133'} />
            </TouchableOpacity>
            <View style={styles.network}>
              <Image
                source={require('assets/icons/wifi.png')}
                style={styles.networkIcon}
              />
              <Text style={styles.networkText}>Testnet</Text>
            </View>
          </View>
        </View>
      </Left>
      <Right>
        <View style={styles.right}>
          <TouchableOpacity
            style={styles.inboxButton}
            onPress={onInboxPress}
            hitSlop={HITSLOP}>
            <EnvelopeSvg />
            {inboxCount ? (
              <View style={styles.badge}>
                <Text style={{ fontSize: 8 }} numberOfLines={1}>
                  {inboxCount >= MAX_MESSAGE_COUNT
                    ? `${MAX_MESSAGE_COUNT - 1}+`
                    : inboxCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
            hitSlop={HITSLOP}>
            <SettingsSvg />
          </TouchableOpacity>
        </View>
      </Right>
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
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
    position: 'absolute',
    right: -8,
    top: -7,
    minHeight: 16,
    minWidth: 16,
    backgroundColor: '#FF6E6E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inboxButton: {
    marginHorizontal: 10,
  },
  settingsButton: {
    marginHorizontal: 10,
  },
  network: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkText: {
    fontSize: 12,
    color: '#687085',
  },
  networkIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginRight: 5,
  },
})

export default HomeNavigationHeader
