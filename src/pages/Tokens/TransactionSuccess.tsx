import { RouteProp } from '@react-navigation/native'
import { AggregateWalletBannerBalance } from 'features/cryptoWallet'
import React from 'react'

import SuccessFailure from 'components/SuccessFailure'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

export type TransactionSuccessRouteProp = RouteProp<
  MainStackParams,
  'TransactionSuccess'
>

export type TransactionSuccessScreenProps = {
  readonly amount: number
  readonly toAddress: string
  readonly aggregateWalletBannerBalance: AggregateWalletBannerBalance
}

const TransactionSuccess = React.memo(
  function TransactionSuccess(): JSX.Element {
    const navigation = useMainNavigation()

    const { amount, toAddress, aggregateWalletBannerBalance } =
      useParams<TransactionSuccessScreenProps>()

    const { resource } = aggregateWalletBannerBalance

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
          })
        }
      />
    )
  }
)

export default TransactionSuccess
