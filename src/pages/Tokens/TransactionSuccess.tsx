import { RouteProp } from '@react-navigation/native'
import {
  BalanceByChainResult,
  formatTokenQuantity,
  getSupportedTokenObjectDecimals,
  //selectSentTransaction,
  useMaybeBlockchainNetwork,
} from 'features/cryptoWallet'
import React from 'react'

//import { connect } from 'react-redux'
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
  readonly token: BalanceByChainResult
}

const TransactionSuccess = React.memo(
  function TransactionSuccess(): JSX.Element {
    const navigation = useMainNavigation()

    const { amount, toAddress, token } =
      useParams<TransactionSuccessScreenProps>()

    //const { data } = sentTransaction
    const titleText = 'Success!'

    const maybeBlockchainNetwork = useMaybeBlockchainNetwork(
      token.asset.chainId
    )

    const decimals = getSupportedTokenObjectDecimals(
      token.token,
      maybeBlockchainNetwork
    )

    const transferQuantity = formatTokenQuantity(amount, decimals)

    const descriptionText = `${transferQuantity} ${token.symbol} sent to ${toAddress}`
    const buttonLabel = 'Done'

    return (
      <SuccessFailure // <- lol
        failure={false}
        titleText={titleText}
        descriptionText={descriptionText}
        buttonLabel={buttonLabel}
        actionButtonOnPress={() =>
          navigation.navigate('SingleCurrency', { item: token })
        }
      />
    )
  }
)

export default TransactionSuccess

//const mapStateToProps = (state) => {
//  return {
//    sentTransaction: selectSentTransaction(state),
//  }
//}
//
//const mapDispatchToProps = () => {
//  return {}
//}
//
//export default connect(mapStateToProps, mapDispatchToProps)(TransactionSuccess)
