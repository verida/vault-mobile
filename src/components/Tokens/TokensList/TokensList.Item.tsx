import { Logo, Typography } from 'components'
import {
  AggregateWalletBannerBalance,
  fixedPointCryptoAsBigDecimal,
} from 'features/cryptoWallet'
import { useThemeAwareStyle } from 'hooks'
import React from 'react'
import {
  GestureResponderEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'

import { Theme } from 'styles/types'

import { TokensListItemPrice } from './TokensList.Item.Price'

export type TokensListItemProps = {
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
  readonly onPress: (event: GestureResponderEvent) => void
} & ViewProps

export const TokensListItem: React.FC<TokensListItemProps> = (props) => {
  const { aggregateWalletBannerBalance, onPress, ...viewProps } = props
  const {
    icon: logoUri,
    label,
    symbol,
    balance,
    decimals,
    valuation,
  } = aggregateWalletBannerBalance

  const styles = useThemeAwareStyle(createStyles)

  return (
    <View {...viewProps}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <Logo uri={logoUri || undefined} alt={symbol} style={styles.logo} />
          <View style={styles.tokenDetails}>
            <View style={styles.tokenNameAndBalance}>
              <Typography variant='h4'>{label}</Typography>
              <Typography variant='h4'>
                {
                  String(
                    fixedPointCryptoAsBigDecimal({
                      amount: balance,
                      decimals,
                    })
                      .toNumber()
                      .toFixed(3)
                  ) as `${number}`
                }
              </Typography>
            </View>
            {valuation ? <TokensListItemPrice valuation={valuation} /> : null}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 17,
      flexDirection: 'row',
    },
    logo: {
      width: 45,
      height: 45,
    },
    tokenDetails: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: theme.spacing.m,
    },
    tokenNameAndBalance: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  })
