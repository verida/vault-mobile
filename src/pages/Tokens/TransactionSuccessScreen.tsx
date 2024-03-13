import { AggregateWalletBannerBalance } from 'features/cryptoWallet'
import React from 'react'

import SuccessFailure from 'components/SuccessFailure'
import { MainStackScreenProps } from 'navigation/types'

export type TransactionSuccessScreenParams = {
  readonly amount: number
  readonly toAddress: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

type TransactionSuccessScreenProps = MainStackScreenProps<'TransactionSuccess'>

export const TransactionSuccessScreen: React.FC<
  TransactionSuccessScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { amount, toAddress, aggregateWalletBannerBalance } = params

  const { resource, label: title } = aggregateWalletBannerBalance

  const titleText = 'Success!'

  const descriptionText = `You sent ${amount} ${aggregateWalletBannerBalance.symbol} to ${toAddress}.`
  const buttonLabel = 'Done'

  return (
    <SuccessFailure // <- lol
      failure={false}
      titleText={titleText}
      descriptionText={descriptionText}
      buttonLabel={buttonLabel}
      actionButtonOnPress={() =>
        navigation.navigate('SingleCurrency', {
          resource,
          title,
        })
      }
    />
  )
}
