import { useActiveWalletConnectSession } from 'features/walletConnect'
import * as React from 'react'
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { iconStyle, text } from 'styles'

import Text from 'components/Text'
import { BLACK_COLOR_OPACITY } from 'constants/color'

export const WalletConnectSessionItem = React.memo(
  function WalletConnectSessionItem({
    walletConnectSessionKey,
    onPress,
  }: {
    readonly walletConnectSessionKey: string
    readonly onPress: (e: GestureResponderEvent) => void
  }): JSX.Element {
    const dapp = useActiveWalletConnectSession({ walletConnectSessionKey })
    return (
      <TouchableOpacity key={walletConnectSessionKey} onPress={onPress}>
        <View style={styles.appContainer}>
          <Image
            style={iconStyle.normal}
            source={{
              // TODO: What is the default image to use? (i.e. || WalletConnectLogoUri)?
              uri: dapp?.peer?.metadata?.icons?.[0],
            }}
          />
          <View style={styles.appTextContainer}>
            <Text style={[text.primary, styles.textAlignLeft]}>
              {dapp?.peer?.metadata?.name}
            </Text>
            <Text style={[text.grey, styles.textAlignLeft]}>
              {dapp?.peer?.metadata?.url}
            </Text>
            <Text
              //eslint-disable-next-line react/no-children-prop
              children={`PeerId: ${dapp?.peer?.publicKey}`}
              style={[text.grey, styles.textAlignLeft]}
            />
          </View>
          <Icon
            size={22}
            // TODO: create a hook for margins
            style={{ marginLeft: 16 }}
            name='keyboard-arrow-right'
            color={BLACK_COLOR_OPACITY(0.45)}
          />
        </View>
      </TouchableOpacity>
    )
  }
)

const styles = StyleSheet.create({
  appContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
  },
  appTextContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 16 },
  textAlignLeft: { textAlign: 'left' },
})
