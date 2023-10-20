import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { Alert, AlertType } from 'components/Alert'
import { Logo } from 'components/Images'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { Theme } from 'styles/types'

export type WalletSelectorButtonProps = {
  label: string
  logo?: string
  address?: string
  formattedBalance?: string
  //onPress: () => void
  alertType?: AlertType // FIXME: Tried with Pick<AlertProps, 'type'> but got ts errors
  alertContent?: React.ReactNode | string // FIXME: Tried with Pick<AlertProps, 'children'> but got ts errors
} & ViewProps

export const WalletSelectorButton: React.FunctionComponent<WalletSelectorButtonProps> =
  (props) => {
    const {
      label,
      logo,
      address,
      formattedBalance,
      alertType,
      alertContent,
      ...viewProps
    } = props

    const styles = useThemeAwareStyle(createStyles)

    // TODO: Add the button when the wallet selector modal is ready

    return (
      <View {...viewProps}>
        <View style={styles.container}>
          <View style={styles.walletContainer}>
            <Logo uri={logo} alt={label} style={styles.walletLogo} />
            <View style={styles.walletInfoContainer}>
              <Text style={styles.walletLabel}>{label}</Text>
              <Text
                style={styles.walletAddress}
                numberOfLines={1}
                ellipsizeMode='middle'>
                {address}
              </Text>
              {formattedBalance ? (
                <Text style={styles.walletFormattedBalance}>
                  {formattedBalance}
                </Text>
              ) : null}
            </View>
          </View>
          {alertContent ? (
            <Alert type={alertType} style={styles.alertContainer}>
              {alertContent}
            </Alert>
          ) : null}
        </View>
      </View>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'column',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: theme.color.lightGrey,
    },
    walletContainer: {
      flexDirection: 'row',
    },
    walletLogo: {
      width: 64,
      aspectRatio: 1,
      marginRight: theme.spacing.m,
    },
    walletInfoContainer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    walletLabel: {
      color: theme.color.black,
      fontSize: theme.fontSize.sl,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    walletAddress: {
      color: theme.color.black500,
      fontSize: theme.fontSize.m,
      lineHeight: 21,
      fontFamily: NUNITO_SANS,
    },
    walletFormattedBalance: {
      color: theme.color.black,
      fontSize: theme.fontSize.m,
      lineHeight: 21,
      fontFamily: NUNITO_SANS,
    },
    alertContainer: {
      marginTop: theme.spacing.s,
    },
  })
