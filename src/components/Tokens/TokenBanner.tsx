import {
  BalanceByChainResult,
  priceFormatter,
  WithMaybeIcon,
  WithMaybeTokenType,
} from 'features/cryptoWallet'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { BlockchainWalletWithAccounts } from 'api/types'
// import BuyIcon from 'assets/buy_icon.svg'
import CopyIcon from 'assets/copy_icon.svg'
import ReceiveIcon from 'assets/receive_icon.svg'
import SendIcon from 'assets/send_icon.svg'
import Text from 'components/Text'
import { PRIMARY_COLOR, WHITE_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from 'constants/text'

const TokenBanner = React.memo(function TokenBanner({
  data,
  sendButtonAction: maybeSendButtonAction,
  selectedWallet,
  receiveButtonAction: maybeReceiveButtonAction,
  copyButtonAction: maybeCopyButtonAction,
}: {
  readonly selectedWallet?: BlockchainWalletWithAccounts
  readonly sendButtonAction?: () => void
  readonly receiveButtonAction?: () => void
  readonly copyButtonAction?: () => void
  readonly data: Partial<
    WithMaybeIcon<WithMaybeTokenType<BalanceByChainResult>>
  >
}): JSX.Element {
  const {
    label,
    price = 0,
    change: maybeChange,
    amount = 0,
    symbol,
    quantity,
    icon,
    tokenType,
  } = data

  const hasChange = typeof maybeChange === 'number'

  const positive = hasChange && maybeChange > 0

  return (
    <View style={styles.bannerWrapper}>
      {symbol && (
        <View style={styles.coinInfo}>
          <Text style={styles.coinText}>{tokenType ? tokenType : 'Coin'}</Text>
          <View style={styles.coinPriceInfo}>
            <Text style={styles.coinPrice}>{priceFormatter(price)}</Text>
            {hasChange ? (
              <Text
                style={[
                  styles.coinPriceChange,
                  positive ? styles.positive : styles.negative,
                ]}>
                {positive
                  ? `+ ${maybeChange.toFixed(2)}%`
                  : `${maybeChange.toFixed(2)}%`}
              </Text>
            ) : undefined}
          </View>
        </View>
      )}
      <View style={styles.totals}>
        {icon && (
          <View style={styles.coinIcon}>
            <Image source={{ uri: icon }} style={styles.icon} />
          </View>
        )}
        <Text style={styles.amount}>
          {label ? `${quantity} ${symbol}` : `${priceFormatter(amount)}`}
        </Text>
        <Text style={styles.amountLabel}>
          {label ? `≈ ${priceFormatter(amount)}` : `Total Balance`}
        </Text>
      </View>
      {symbol && (
        <View style={styles.actionIcons}>
          {Boolean(selectedWallet && !selectedWallet.viewOnly) && (
            <TouchableOpacity
              disabled={!maybeSendButtonAction}
              onPress={maybeSendButtonAction}
              style={[
                styles.singleActionIcon,
                !maybeSendButtonAction && styles.disabled,
              ]}>
              <SendIcon />
              <Text style={styles.actionIconText}>Send</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            disabled={!maybeReceiveButtonAction}
            onPress={maybeReceiveButtonAction}
            style={[
              styles.singleActionIcon,
              !maybeReceiveButtonAction && styles.disabled,
            ]}>
            <ReceiveIcon />
            <Text style={styles.actionIconText}>Receive</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={buyButtonAction}
            style={styles.singleActionIcon}>
            <BuyIcon />
            <Text style={styles.actionIconText}>Buy</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            disabled={!maybeCopyButtonAction}
            onPress={maybeCopyButtonAction}
            style={[
              styles.singleActionIcon,
              !maybeCopyButtonAction && styles.disabled,
            ]}>
            <CopyIcon />
            <Text style={styles.actionIconText}>Copy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  bannerWrapper: {
    margin: 15,
    backgroundColor: PRIMARY_COLOR,
    padding: 20,
    borderRadius: 12,
  },
  coinInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  coinText: {
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  coinPriceInfo: {
    flexDirection: 'row',
  },
  coinPrice: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  coinPriceChange: {
    marginLeft: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  positive: {
    color: '#5ECEA5',
  },
  negative: {
    color: '#FD4F64',
  },
  totals: {
    alignItems: 'center',
  },
  coinIcon: {
    marginTop: 12,
    marginBottom: 10,
  },
  amount: {
    color: WHITE_COLOR,
    fontSize: 28,
    fontFamily: NUNITO_SANS_BOLD,
  },
  amountLabel: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 24,
  },
  actionIconText: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    color: WHITE_COLOR,
    textAlign: 'center',
    marginTop: 4,
  },
  icon: { width: 45, height: 45 },
  singleActionIcon: {},
})

export default TokenBanner
