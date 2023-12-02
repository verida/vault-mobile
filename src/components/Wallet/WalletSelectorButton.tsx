import { ChainIdParams } from 'caip'
import {
  AggregateWalletBannerBalance,
  useMaybeBlockchainAccountForResource,
  useMaybeChainMetadataForResource,
  useMaybeFromAddressForResource,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import { Alert, AlertType } from 'components/Alert'
import { Logo } from 'components/Images'
import { NumericCryptoBalance } from 'components/Span'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { Theme } from 'styles/types'

export type WalletSelectorButtonProps = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance | null

  label: string
  logo?: string

  // TODO: This should be useAddressForBalance or something - based on `resource`?
  address?: string

  alertType?: AlertType // FIXME: Tried with Pick<AlertProps, 'type'> but got ts errors
  alertContent?: React.ReactNode | string // FIXME: Tried with Pick<AlertProps, 'children'> but got ts errors
} & ViewProps

export function useMaybeWalletSelectorButtonProps({
  aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
  resource,
  alertContent,
  alertType,
}: {
  readonly aggregateWalletBannerBalance:
    | AggregateWalletBannerBalance
    | null
    | undefined
  readonly resource: ChainIdParams
  readonly alertContent?: string
  readonly alertType?: AlertType
}): WalletSelectorButtonProps | null {
  const maybeChainMetadata = useMaybeChainMetadataForResource({ resource })

  const maybeBlockchainWallet = useMaybeBlockchainAccountForResource({
    resource,
  })

  const maybeFromAddressForResource = useMaybeFromAddressForResource({
    resource,
  })

  return React.useMemo(() => {
    if (!maybeBlockchainWallet || !maybeAggregateWalletBannerBalance)
      return null

    const { icon, label } = maybeBlockchainWallet

    return {
      aggregateWalletBannerBalance: maybeAggregateWalletBannerBalance,
      logo: icon || maybeChainMetadata?.icon || undefined,
      label: label,
      address: maybeFromAddressForResource?.fromAddress,
      alertType,
      alertContent,
    }
  }, [
    alertContent,
    alertType,
    maybeAggregateWalletBannerBalance,
    maybeBlockchainWallet,
    maybeFromAddressForResource,
    maybeChainMetadata,
  ])
}

export const WalletSelectorButton: React.FunctionComponent<WalletSelectorButtonProps> =
  (props) => {
    const {
      aggregateWalletBannerBalance,

      label,
      logo,
      address,
      //formattedBalance,
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
              <Text style={styles.walletFormattedBalance}>
                {!!aggregateWalletBannerBalance && (
                  <NumericCryptoBalance {...aggregateWalletBannerBalance} />
                )}
              </Text>
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
      justifyContent: 'center',
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
