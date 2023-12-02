import BigDecimal from 'bignumber.js'
import { ChainId } from 'caip'
import { Logo } from 'components'
import {
  AggregateWalletBannerBalance,
  getAggregateWalletBannerBalanceResult,
  useAggregateWalletBannerBalances,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'

import {
  NumericCryptoBalance,
  NumericFiatPaymentRequest,
  NumericFiatWithAccuracy,
} from 'components/Span'
import { CONFUSED_FACE } from 'constants/strings'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

export type RequestPaymentValueProps = {
  readonly integerCryptoAmount: `${number}`
  readonly aggregateWalletBannerBalance:
    | AggregateWalletBannerBalance
    | null
    | undefined
  readonly chainId: ChainId
} & ViewProps

export const RequestPaymentValue: React.FunctionComponent<RequestPaymentValueProps> =
  (props) => {
    const {
      integerCryptoAmount,
      aggregateWalletBannerBalance,
      chainId,
      ...viewProps
    } = props

    // Describes how to convert between a whole unit of an asset, i.e. 1 ETH,
    // and the base currency.
    const maybeValuation = aggregateWalletBannerBalance?.valuation

    const styles = useThemeAwareStyle(createStyles)

    const assetSymbol = aggregateWalletBannerBalance?.symbol
    const assetLogo = aggregateWalletBannerBalance?.icon || undefined

    const [maybeNativeAssetWalletBannerBalance] =
      getAggregateWalletBannerBalanceResult(
        useAggregateWalletBannerBalances({
          resource: chainId,
        })
      )

    const chainLabel = maybeNativeAssetWalletBannerBalance?.label
    const chainLogo = maybeNativeAssetWalletBannerBalance?.icon || undefined

    const hasCurrencyAndConversionRate = !!(
      maybeValuation?.currency && maybeValuation?.conversionRate
    )

    const maybeConversionRate = React.useMemo(
      () => new BigDecimal(maybeValuation?.conversionRate || 0),
      [maybeValuation?.conversionRate]
    )

    return (
      <View {...viewProps}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Logo uri={assetLogo} alt={assetSymbol} style={styles.assetLogo} />
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.primaryValue}>
              {integerCryptoAmount && assetSymbol ? (
                <NumericCryptoBalance
                  decimals={aggregateWalletBannerBalance?.decimals}
                  balance={integerCryptoAmount}
                  symbol={assetSymbol}
                />
              ) : (
                CONFUSED_FACE
              )}
            </Text>
            <Text style={styles.secondaryValue}>
              <NumericFiatPaymentRequest
                integerCryptoAmount={integerCryptoAmount}
                valuation={maybeValuation}
                decimals={aggregateWalletBannerBalance?.decimals}
              />
            </Text>
          </View>
          {Boolean(hasCurrencyAndConversionRate || chainLabel || chainLogo) && (
            <View style={styles.footer}>
              {hasCurrencyAndConversionRate ? (
                <View>
                  <Text
                    style={[
                      styles.footerText,
                      styles.footerLeftText,
                      styles.footerLabelText,
                    ]}>
                    {assetSymbol ? `1 ${assetSymbol} ≈` : undefined}
                  </Text>
                  <Text
                    style={[
                      styles.footerText,
                      styles.footerLeftText,
                      styles.footerValueText,
                    ]}>
                    <NumericFiatWithAccuracy
                      currency={maybeValuation?.currency}
                      isAccurate
                      value={maybeConversionRate}
                    />
                  </Text>
                </View>
              ) : (
                <View style={styles.flex} />
              )}

              {Boolean(chainLabel || chainLogo) && (
                <View>
                  <Text
                    style={[
                      styles.footerText,
                      styles.footerRightText,
                      styles.footerLabelText,
                    ]}>
                    Network
                  </Text>
                  <View style={styles.chainContainer}>
                    <Logo
                      uri={chainLogo}
                      alt={chainLabel}
                      style={styles.chainLogo}
                    />
                    <Text
                      style={[
                        styles.footerText,
                        styles.footerRightText,
                        styles.footerValueText,
                      ]}>
                      {chainLabel}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.s,
      paddingTop: theme.spacing.m,
      backgroundColor: '#F5F4FF', // TODO: Add to theme
      borderRadius: theme.roundness.xs,
    },
    flex: { flex: 1 },
    logoContainer: {
      alignItems: 'center',
    },
    valueContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    primaryValue: {
      fontSize: 36,
      lineHeight: 46.8,
      letterSpacing: -0.41,
      fontFamily: NUNITO_SANS_BOLD, // TODO: Add to theme
      color: 'rgba(4, 17, 51, 0.8)', // TODO: Add to theme
    },
    secondaryValue: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: NUNITO_SANS_SEMIBOLD, // TODO: Add to theme
      color: 'rgba(4, 17, 51, 0.6)', // TODO: Add to theme
    },
    assetLogo: {
      width: 32,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.l,
    },
    footerText: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontSize: 12,
      lineHeight: 18,
    },
    footerLeftText: {
      textAlign: 'left',
    },
    footerRightText: {
      textAlign: 'right',
    },
    footerLabelText: {
      color: 'rgba(4, 17, 51, 0.4)', // TODO: Add to theme
    },
    footerValueText: {
      color: 'rgba(4, 17, 51, 0.7)', // TODO: Add to theme
    },
    chainContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chainLogo: {
      width: 12,
      marginRight: theme.spacing.xs,
    },
  })
