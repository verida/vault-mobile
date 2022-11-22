import { Header, Left, Right } from 'native-base'
import React from 'react'
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import EnvelopeSvg from 'assets/icons/envelope.svg'
import Text from 'components/Text'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

export type HomeNavigationHeaderProps = Omit<ViewProps, 'children'> & {
  avatar: ImageSourcePropType
  name: string
  did: string
  inboxCount: number
  onAvatarPress: () => void
  onNamePress: () => void
  onInboxPress: () => void
  onSettingsPress?: () => void
}

const MAX_MESSAGE_COUNT = 21
const HITSLOP = { top: 10, right: 10, bottom: 10, left: 10 }

function HomeNavigationHeader(props: HomeNavigationHeaderProps) {
  const {
    did,
    avatar,
    name,
    inboxCount,
    onAvatarPress,
    onNamePress,
    onInboxPress,
    // onSettingsPress,
    ...rest
  } = props

  return (
    <Header
      transparent
      style={styles.header}
      androidStatusBarColor='light-gray'
      {...rest}>
      <Left style={styles.leftContainer}>
        <View style={styles.left}>
          <Pressable style={styles.avatarButton} onPress={onAvatarPress}>
            <Image source={avatar} style={styles.avatar} />
          </Pressable>
          <View style={styles.titleContainer}>
            <TouchableOpacity style={styles.nameButton} onPress={onNamePress}>
              <Text style={styles.name} lineBreakMode='tail' numberOfLines={1}>
                {name}
              </Text>
              <AntDesign name={'right'} size={15} color={'#808695'} />
            </TouchableOpacity>
            <View style={styles.network}>
              <View style={styles.textChipBox}>
                <Text style={styles.textChip}>Personal</Text>
              </View>
              <Text style={styles.didText} numberOfLines={1}>
                DID: {did.slice(0, 10)}...{did.slice(-4)}
              </Text>
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
        </View>
      </Right>
    </Header>
  )
}

const styles = StyleSheet.create({
  header: {
    elevation: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  leftContainer: {
    flex: 2,
    marginRight: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  avatarButton: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 20,
  },
  name: {
    fontSize: 20,
    marginRight: 4,
    fontFamily: NUNITO_SANS_BOLD,
    color: '#041133',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 27,
  },
  textChipBox: {
    textAlign: 'center',
    marginRight: 8,
    fontFamily: NUNITO_SANS_BOLD,
    borderRadius: 53,
    paddingVertical: 2,
    paddingLeft: 7,
    backgroundColor: '#E7E5FF',
  },
  textChip: {
    fontFamily: NUNITO_SANS,
    fontSize: 11,
    fontWeight: '600',
    borderRadius: 20,
    marginRight: 8,
    textAlign: 'center',
    color: '#041133',
    opacity: 0.8,
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
  didText: {
    fontSize: 12,
    color: '#687085',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default HomeNavigationHeader
