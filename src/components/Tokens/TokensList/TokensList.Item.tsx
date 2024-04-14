import { ChainId } from 'caip'
import { Logo, Typography } from 'components'
import { getMaybeChainMetadatas, useChainMetadatas } from 'features/blockchain'
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
import { getSignificantDecimalsFromPrice } from 'utils'

import { NumberCrypto } from 'components/Numbers'
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
    resource,
  } = aggregateWalletBannerBalance

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const itemChainId = new ChainId(
    'chainId' in resource ? resource.chainId : resource
  )

  const itemChain = chainMetadatas.find(
    (chain) =>
      chain.namespace === itemChainId.namespace &&
      chain.reference === itemChainId.reference
  )

  const isMainnet = itemChain?.isMainnet

  const styles = useThemeAwareStyle(createStyles)

  const nbDecimals = valuation?.conversionRate
    ? getSignificantDecimalsFromPrice(valuation.conversionRate.toNumber())
    : undefined

  return (
    <View {...viewProps}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <View>
            <Logo uri={logoUri || undefined} alt={symbol} style={styles.logo} />
            {itemChain?.icon ? (
              <Logo uri={itemChain.icon} style={styles.chainLogo} />
            ) : null}
          </View>
          <View style={styles.tokenDetails}>
            <View style={styles.tokenNameAndBalance}>
              <Typography
                variant='h4'
                ellipsizeMode='tail'
                numberOfLines={1}
                style={styles.tokenLabel}>
                {label}
              </Typography>
              <NumberCrypto
                value={fixedPointCryptoAsBigDecimal({
                  amount: balance,
                  decimals,
                }).toNumber()}
                nbDecimals={nbDecimals}
                variant='h4'
              />
            </View>
            {isMainnet ? (
              <>
                {valuation ? (
                  <TokensListItemPrice valuation={valuation} />
                ) : null}
              </>
            ) : (
              <View style={styles.testnetTag}>
                <Typography
                  variant='bodySemiBold'
                  style={styles.testnetTagText}>
                  Testnet
                </Typography>
              </View>
            )}
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
    chainLogo: {
      width: 20,
      height: 20,
      position: 'absolute',
      right: -4,
      bottom: -4,
    },
    tokenDetails: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: theme.spacing.m,
    },
    tokenNameAndBalance: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.m,
    },
    tokenLabel: {
      flex: 1,
    },
    testnetTag: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.roundness.xs,
      backgroundColor: theme.color.snow,
    },
    testnetTagText: {
      color: theme.color.textLightGrey,
    },
  })
