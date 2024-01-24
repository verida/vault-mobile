import BigDecimal from 'bignumber.js'
import { useTheme } from 'contexts'
import {
  Currency,
  DetailedValuation,
  fixedPointCryptoAsBigDecimal,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native'
import { getSignificantDecimalsFromPrice } from 'utils'

import { BlockchainWalletWithAccounts } from 'api/types'
import { Icon } from 'components/Icon'
import { Logo } from 'components/Images'
import { NumberCrypto, NumberFiat, NumberPercent } from 'components/Numbers'
import { Typography } from 'components/Typography'
import { Theme } from 'styles/types'

export type TokenBannerProps = {
  readonly selectedWallet?: BlockchainWalletWithAccounts
  readonly sendButtonAction?: () => void
  readonly receiveButtonAction?: () => void
  readonly copyButtonAction?: () => void
  readonly tokenBalanceValue: BigDecimal
  readonly tokenBalanceValueCurrency?: Currency
  readonly symbol: string
  readonly icon?: string
  readonly tokenBalance: string
  readonly decimals: number
  readonly valuation: DetailedValuation | null | undefined
  readonly chainLabel?: string
  readonly chainLogo?: string
} & ViewProps

export const TokenBanner: React.FC<TokenBannerProps> = (props) => {
  const {
    selectedWallet,
    sendButtonAction: maybeSendButtonAction,
    receiveButtonAction: maybeReceiveButtonAction,
    copyButtonAction: maybeCopyButtonAction,
    tokenBalance,
    tokenBalanceValue,
    tokenBalanceValueCurrency,
    symbol,
    icon,
    decimals,
    valuation: maybeValuation,
    chainLabel,
    chainLogo,
    ...viewProps
  } = props

  const maybeConversionRate = maybeValuation?.conversionRate || null
  const maybeChange = maybeValuation?.rates?.DAILY || null

  const hasChange = typeof maybeChange === 'number'

  const positive = hasChange && maybeChange > 0

  const nbDecimals = maybeValuation?.conversionRate
    ? getSignificantDecimalsFromPrice(maybeValuation.conversionRate.toNumber())
    : undefined

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <View style={styles.amounts}>
          {icon && <Logo uri={icon} alt={symbol} style={styles.icon} />}
          <NumberCrypto
            value={fixedPointCryptoAsBigDecimal({
              amount: tokenBalance,
              decimals,
            }).toNumber()}
            nbDecimals={nbDecimals}
            unit={symbol}
            variant='h2'
          />
          <View style={styles.value}>
            <Typography
              variant='label'
              style={styles.valueText}>{`≈ `}</Typography>
            <NumberFiat
              value={tokenBalanceValue.toNumber()}
              unit={tokenBalanceValueCurrency}
              variant='label'
              style={styles.valueText}
            />
          </View>
        </View>
        <View style={styles.coinInfo}>
          <View style={styles.coinPriceInfo}>
            {!!maybeConversionRate && (
              <NumberFiat
                value={maybeConversionRate.toNumber()}
                unit={maybeValuation?.currency}
                options={{
                  minimumSignificantDigits: 2,
                  maximumSignificantDigits: 6,
                }}
                style={styles.coinPrice}
              />
            )}
            {hasChange ? (
              <NumberPercent
                value={maybeChange / 100}
                options={{
                  signDisplay: 'always',
                }}
                style={[
                  positive
                    ? styles.priceChangePositive
                    : styles.priceChangeNegative,
                ]}
              />
            ) : null}
          </View>
          <View style={styles.tokenNetworkInfo}>
            <Typography style={styles.tokenNetworkLabel}>Network</Typography>
            <View style={styles.tokenNetworkContainer}>
              <Logo
                uri={chainLogo}
                alt={chainLabel}
                style={styles.tokenNetworkLogo}
              />
              <Typography style={styles.tokenNetworkText}>
                {chainLabel}
              </Typography>
            </View>
          </View>
        </View>
        <View style={styles.separator} />
        <View style={styles.actions}>
          {Boolean(selectedWallet && !selectedWallet.viewOnly) && (
            <TouchableOpacity
              disabled={!maybeSendButtonAction}
              onPress={maybeSendButtonAction}
              style={[
                styles.actionButton,
                !maybeSendButtonAction && styles.disabled,
              ]}>
              <View style={styles.actionIconWrapper}>
                <Icon name='send' size={24} color={theme.color.primary} />
              </View>
              <Typography variant='bodySemiBold' style={styles.actionIconText}>
                Send
              </Typography>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            disabled={!maybeReceiveButtonAction}
            onPress={maybeReceiveButtonAction}
            style={[
              styles.actionButton,
              !maybeReceiveButtonAction && styles.disabled,
            ]}>
            <View style={styles.actionIconWrapper}>
              <Icon name='receive' size={24} color={theme.color.primary} />
            </View>
            <Typography variant='bodySemiBold' style={styles.actionIconText}>
              Receive
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!maybeCopyButtonAction}
            onPress={maybeCopyButtonAction}
            style={[
              styles.actionButton,
              !maybeCopyButtonAction && styles.disabled,
            ]}>
            <View style={styles.actionIconWrapper}>
              <Icon name='copy' size={24} color={theme.color.primary} />
            </View>
            <Typography variant='bodySemiBold' style={styles.actionIconText}>
              Copy
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.color.primary5,
      padding: theme.spacing.m,
      borderRadius: theme.roundness.l,
    },
    coinInfo: {
      marginBottom: theme.spacing.s,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    coinPriceInfo: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    coinPrice: {
      color: theme.color.textLightGrey,
    },
    tokenNetworkInfo: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    tokenNetworkLabel: {
      color: theme.color.textLightGrey,
    },
    tokenNetworkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenNetworkText: {
      // color: theme.color.textLightGrey,
    },
    tokenNetworkLogo: {
      width: 12,
      marginRight: theme.spacing.xs,
    },
    disabled: {
      opacity: 0.5,
    },
    priceChangePositive: {
      color: theme.color.success,
    },
    priceChangeNegative: {
      color: theme.color.error,
    },
    amounts: {
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    value: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    valueText: {
      color: theme.color.textLightGrey,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: theme.spacing.m,
    },
    actionButton: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    actionIconWrapper: {
      padding: theme.spacing.sm,
      backgroundColor: theme.color.primary100,
      borderRadius: theme.roundness.l,
    },
    actionIconText: {
      textAlign: 'center',
      marginTop: 4,
      color: theme.color.textLightGrey,
    },
    icon: {
      marginBottom: 10,
      width: 45,
      height: 45,
    },
    separator: {
      height: 1,
      backgroundColor: theme.color.lightGrey,
    },
  })
