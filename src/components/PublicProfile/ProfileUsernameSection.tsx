import Clipboard from '@react-native-community/clipboard'
import { useNavigation } from '@react-navigation/native'
import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import {
  Image,
  ImageBackground,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Snackbar from 'react-native-snackbar'

import Button from 'components/Button'
import { Icon } from 'components/Icon'
import { Label } from 'components/Typography/Label'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type Props = {
  did: string
  username?: string
  loading?: boolean
}

const VERIDA_ONE_WEBSITE = 'https://demo.verida.one/'

export const ProfileUsernameSection = ({ did, username }: Props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)
  const navigation = useNavigation()
  const buildUrl = () => `${VERIDA_ONE_WEBSITE}${username || did}`

  return (
    <ImageBackground
      resizeMode='stretch'
      source={require('assets/profile_link_bg.png')}
      style={styles.oneProfileLinkContainer}>
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(buildUrl())
          Snackbar.show({
            text: 'Copied to clipboard',
            duration: Snackbar.LENGTH_SHORT,
          })
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 28,
          }}>
          <SubHeadline
            numberOfLines={1}
            ellipsizeMode='tail'
            style={{
              color: theme.color.onPrimary,
              marginRight: theme.spacing.xs,
            }}>{`verida.one/${username || did}`}</SubHeadline>
          <Icon name='copy' color={theme.color.onPrimary} size={16} />
        </View>
      </TouchableOpacity>
      <Label
        style={{ color: theme.color.onPrimary, marginBottom: theme.spacing.m }}>
        Edited 12.12.2022
      </Label>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
        }}>
        <Button
          textStyle={{
            fontSize: theme.fontSize.m,
            color: theme.color.onPrimary,
          }}
          style={styles.roundedButton}
          color='transparent'
          onPress={() => {
            Linking.openURL(buildUrl())
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: theme.fontSize.m,
                fontWeight: '700',
                color: theme.color.onPrimary,
                marginRight: theme.spacing.s,
              }}>
              Go to
            </Text>
            <Icon name='goto' color={theme.color.onPrimary} size={16} />
          </View>
        </Button>
        <Button
          textStyle={{
            fontSize: theme.fontSize.m,
            color: theme.color.onPrimary,
          }}
          style={[styles.roundedButton, { marginLeft: theme.spacing.m }]}
          color='transparent'
          onPress={() => {
            Share.share({
              title: 'Verida One',
              message: `My profile ${buildUrl()}`,
              url: buildUrl(),
            })
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: theme.fontSize.m,
                fontWeight: '700',
                color: theme.color.onPrimary,
                marginRight: theme.spacing.s,
              }}>
              Share
            </Text>
            <Icon name='share' color={theme.color.onPrimary} size={16} />
          </View>
        </Button>
      </View>
      {username ? null : (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <SubHeadline style={{ color: theme.color.onPrimary }}>
              Claim your unique username now!
            </SubHeadline>
            <Text style={{ color: theme.color.onPrimary }}>
              Secure your identity with a personalized username for easier
              sharing and increased privacy
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Image
              style={{
                marginLeft: 20,
                marginBottom: theme.spacing.m,
                width: 111,
                height: 120,
              }}
              source={require('assets/username_placehoder.png')}
            />

            <Button
              textStyle={{
                fontSize: theme.fontSize.m,
                color: theme.color.onPrimary,
              }}
              style={styles.capsuleButtton}
              color='transparent'
              onPress={() => navigation.navigate('ClaimUsername')}>
              Claim username
            </Button>
          </View>
        </View>
      )}
    </ImageBackground>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    oneProfileLinkContainer: {
      position: 'relative',
      minHeight: 140,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      resizeMode: 'center',
      padding: theme.spacing.sm,
    },
    veridaWalletName: {
      color: theme.color.textLightGrey,
    },
    card: {
      backgroundColor: Color(theme.color.onPrimary).alpha(0.15).toString(),
      borderRadius: 12,
      flexDirection: 'row',
      width: '100%',
      padding: theme.spacing.sm,
      marginTop: theme.spacing.m,
    },
    capsuleButtton: {
      borderRadius: 38,
      height: 32,
      borderColor: theme.color.onPrimary,
      backgroundColor: Color(theme.color.onPrimary).alpha(0.3).toString(),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
    },
    roundedButton: {
      flex: 1,
      borderRadius: theme.roundness.l,
      backgroundColor: Color(theme.color.onPrimary).alpha(0.15).toString(),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
    },
  })
