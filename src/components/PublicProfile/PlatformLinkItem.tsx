import Color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { Image, StyleSheet, Switch, TouchableOpacity, View } from 'react-native'

import { VeridaOnePlatformLink } from 'api/types'
import DragIcon from 'assets/drag_icon.svg'
import EditIcon from 'assets/edit_icon.svg'
import VeridaTick from 'assets/icons/verida_tick.svg'
import Button from 'components/Button'
import { Label } from 'components/Typography/Label'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { Text } from 'components/Typography/Text'
import { PLATFORM_LINKS } from 'constants/profile'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { smallButtonHitSlop } from 'styles/button'
import { Theme } from 'styles/types'

type Props = {
  platformLink: VeridaOnePlatformLink
  drag: () => void
  isActive: boolean
  onEditPlatformInfo?: () => void
  setShowOnVeridaOne: (
    platformLink: VeridaOnePlatformLink,
    visible: boolean
  ) => void
}

export const PlatformLinkItem = ({
  platformLink,
  drag,
  isActive,
  onEditPlatformInfo,
  setShowOnVeridaOne,
}: Props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)
  const showOnVeridaOne = platformLink.showOnVeridaOne
  const connectedPlatform = platformLink.connectedPlatform

  const platformMeta = PLATFORM_LINKS[platformLink.platform] ?? {}

  return (
    <View
      style={[
        styles.walletItemContainer,
        {
          backgroundColor: showOnVeridaOne
            ? theme.color.background
            : theme.color.snow,
        },
      ]}>
      <TouchableOpacity
        hitSlop={smallButtonHitSlop}
        onPressIn={showOnVeridaOne ? drag : undefined}
        disabled={isActive}>
        <View style={{ marginHorizontal: theme.spacing.xs }}>
          <DragIcon
            fill={
              showOnVeridaOne
                ? theme.color.iconDefault
                : theme.color.transparent
            }
          />
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            <Image
              source={platformMeta.icon}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              resizeMode='contain'
            />
            <View style={{ marginHorizontal: theme.spacing.s }}>
              <SubHeadline
                ellipsizeMode='tail'
                numberOfLines={2}
                style={{
                  maxWidth: 200,
                  color: theme.color.onBackground,
                }}>
                {platformMeta.label}
              </SubHeadline>
              <Text
                ellipsizeMode='middle'
                numberOfLines={1}
                style={{
                  maxWidth: 180,
                  marginRight: theme.spacing.xs,
                  color: Color(theme.color.onBackground).alpha(0.5).toString(),
                }}>
                {platformLink.accountId ? `@${platformLink.accountId}` : 'N/A'}
              </Text>
            </View>
          </View>
          {!connectedPlatform && (
            <Button
              color={'transparent'}
              disabled={!showOnVeridaOne}
              style={{
                width: 40,
                height: 40,
                marginBottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'lightGrey',
              }}
              onPress={onEditPlatformInfo}>
              {/* Add a wrapped view so on click behavior fixed */}
              <View
                style={{
                  marginLeft: theme.spacing.s,
                  marginBottom: theme.spacing.xs,
                }}>
                <EditIcon fill={theme.color.iconDefault} />
              </View>
            </Button>
          )}
        </View>

        {/* Platform badges */}
        {connectedPlatform && (
          <View style={{ flexDirection: 'row', marginTop: theme.spacing.s }}>
            <View style={styles.pill}>
              <VeridaTick width={20} height={20} />
              <Label
                style={{
                  marginRight: 1,
                  marginLeft: 4,
                  marginVertical: 2,
                  color: theme.color.iconDefault,
                }}>
                Connected
              </Label>
            </View>
          </View>
        )}
        <View
          style={{
            marginVertical: theme.spacing.s,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.color.separatorExtraLight,
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text>Display on Verida One profile</Text>
          <Switch
            trackColor={{
              false: theme.color.switchFalseState,
              true: theme.color.success,
            }}
            onValueChange={(value: boolean) =>
              setShowOnVeridaOne(platformLink, value)
            }
            value={showOnVeridaOne}
          />
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    walletItemContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.color.background,
      borderColor: theme.color.lightGrey,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      paddingVertical: theme.spacing.s,
      paddingRight: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
    veridaWalletName: {
      color: theme?.color.textLightGrey,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.color.lightGrey,
      padding: 2,
      borderRadius: 120,
    },
  })
