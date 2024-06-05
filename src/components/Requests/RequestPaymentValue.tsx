import BigDecimal from 'bignumber.js'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { Logo, Typography } from '~/components'
import { NumberCrypto, NumberFiat } from '~/components/Numbers'
import { CONFUSED_FACE } from '~/constants/strings'
import { ChainMetadata } from '~/features/caip'
import {
  AggregateWalletBannerBalance,
  fixedPointCryptoAsBigDecimal,
} from '~/features/cryptoWallet'
import { convertFromCryptoIntegerToMaybeDecimalFiat } from '~/features/token'
import { useThemeAwareStyle } from '~/hooks'
import { Theme } from '~/styles/types'

export type RequestPaymentValueProps = {
  readonly integerCryptoAmount: `${number}`
  readonly aggregateWalletBannerBalance:
    | AggregateWalletBannerBalance
    | null
    | undefined
  readonly chainMetadata?: ChainMetadata
} & ViewProps

export const RequestPaymentValue: React.FunctionComponent<
  RequestPaymentValueProps
> = ({
  integerCryptoAmount,
  aggregateWalletBannerBalance,
  chainMetadata,
  ...viewProps
}) => {
  // Describes how to convert between a whole unit of an asset, i.e. 1 ETH,
  // and the base currency.
  const maybeValuation = aggregateWalletBannerBalance?.valuation

  const styles = useThemeAwareStyle(createStyles)

  const assetSymbol = aggregateWalletBannerBalance?.symbol
  const assetLogo = aggregateWalletBannerBalance?.icon || undefined

  const isInvalidAmount = isNaN(parseInt(integerCryptoAmount, 10))

  const chainLabel = chainMetadata?.name
  const chainLogo = chainMetadata?.icon || undefined

  const hasCurrencyAndConversionRate = !!(
    maybeValuation?.currency && maybeValuation?.conversionRate
  )

  const maybeConversionRate = React.useMemo(
    () => new BigDecimal(maybeValuation?.conversionRate || 0),
    [maybeValuation?.conversionRate]
  )

  const maybeFiatPaymentAmount = convertFromCryptoIntegerToMaybeDecimalFiat({
    integerCryptoAmount,
    valuation: maybeValuation,
    decimals: aggregateWalletBannerBalance?.decimals,
  })

  return (
    <View {...viewProps}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Logo uri={assetLogo} alt={assetSymbol} style={styles.assetLogo} />
        </View>
        <View style={styles.valueContainer}>
          {integerCryptoAmount && assetSymbol && !isInvalidAmount ? (
            <NumberCrypto
              value={fixedPointCryptoAsBigDecimal({
                amount: integerCryptoAmount,
                decimals: aggregateWalletBannerBalance.decimals,
              }).toNumber()}
              unit={assetSymbol}
              variant='h1'
              style={styles.primaryValue}
              numberOfLines={1}
              ellipsizeMode='tail'
            />
          ) : (
            <Typography variant='h1' style={styles.primaryValue}>
              {CONFUSED_FACE}
            </Typography>
          )}
          {!isInvalidAmount && maybeFiatPaymentAmount ? (
            <Typography variant='label' style={styles.secondaryValue}>
              {`≈ `}
              <NumberFiat
                value={new BigDecimal(maybeFiatPaymentAmount.amount).toNumber()}
                unit={maybeFiatPaymentAmount.units || undefined}
                variant='label'
                style={styles.secondaryValue}
              />
            </Typography>
          ) : null}
        </View>
        {Boolean(hasCurrencyAndConversionRate || chainLabel || chainLogo) && (
          <View style={styles.footer}>
            {hasCurrencyAndConversionRate ? (
              <View>
                <Typography
                  variant='label'
                  style={[styles.footerLeftText, styles.footerLabelText]}>
                  {assetSymbol ? `1 ${assetSymbol} ≈` : undefined}
                </Typography>
                <NumberFiat
                  value={maybeConversionRate.toNumber()}
                  unit={maybeValuation.currency}
                  options={{
                    minimumSignificantDigits: 2,
                    maximumSignificantDigits: 6,
                  }}
                  variant='label'
                  style={[styles.footerLeftText, styles.footerValueText]}
                />
              </View>
            ) : (
              <View style={styles.flex} />
            )}

            {Boolean(chainLabel || chainLogo) && (
              <View>
                <Typography
                  variant='label'
                  style={[styles.footerRightText, styles.footerLabelText]}>
                  Network
                </Typography>
                <View style={styles.chainContainer}>
                  <Logo
                    uri={chainLogo}
                    alt={chainLabel}
                    style={styles.chainLogo}
                  />
                  <Typography
                    variant='label'
                    style={[styles.footerRightText, styles.footerValueText]}>
                    {chainLabel}
                  </Typography>
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
      backgroundColor: theme.color.primary5,
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
      color: theme.color.black800,
    },
    secondaryValue: {
      color: theme.color.black600,
    },
    assetLogo: {
      width: 32,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.l,
    },
    footerLeftText: {
      textAlign: 'left',
    },
    footerRightText: {
      textAlign: 'right',
    },
    footerLabelText: {
      color: theme.color.black400,
    },
    footerValueText: {
      color: theme.color.black700,
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
