import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { OneProfileCustomLink } from 'types/profile'

import DragIcon from 'assets/drag_icon.svg'
import EditIcon from 'assets/edit_icon.svg'
import StarOutlineIcon from 'assets/star_outline.svg'
import StarSolidIcon from 'assets/star_solid.svg'
import Button from 'components/Button'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { smallButtonHitSlop } from 'styles/button'
import { Theme } from 'styles/types'

type Props = {
  customLink: OneProfileCustomLink
  drag: () => void
  isActive: boolean
  onEdit: () => void
  setFeatured: (customLink: OneProfileCustomLink, featured: boolean) => void
}

export const CustomLinkItem = ({
  customLink,
  drag,
  isActive,
  onEdit,
  setFeatured,
}: Props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View style={[styles.itemContainer]}>
      <TouchableOpacity
        hitSlop={smallButtonHitSlop}
        onPressIn={drag}
        disabled={isActive}>
        <View style={{ marginHorizontal: theme.spacing.xs }}>
          <DragIcon fill={theme.color.iconDefault} />
        </View>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View>
          <SubHeadline
            ellipsizeMode='tail'
            numberOfLines={2}
            style={{
              maxWidth: 200,
            }}>
            {customLink.label}
          </SubHeadline>
          <Text
            ellipsizeMode='middle'
            numberOfLines={1}
            style={{
              maxWidth: 100,
              marginRight: theme.spacing.xs,
              color: theme.color.textLightGrey50,
            }}>
            {customLink.url}
          </Text>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Button
            color={'transparent'}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
              marginLeft: 2,
            }}
            onPress={() => setFeatured(customLink, !customLink.featured)}>
            {/* Add a wrapped view so on click behavior fixed */}
            <View>
              {customLink.featured ? (
                <StarSolidIcon />
              ) : (
                <StarOutlineIcon fill={theme.color.iconDefault} />
              )}
            </View>
          </Button>

          <Button
            color={'transparent'}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
              marginLeft: 2,
            }}
            onPress={onEdit}>
            {/* Add a wrapped view so on click behavior fixed */}
            <View>
              <EditIcon fill={theme.color.iconDefault} />
            </View>
          </Button>
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    itemContainer: {
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
      color: theme.color.textLightGrey,
    },
  })
