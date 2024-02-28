import { RouteProp } from '@react-navigation/native'
import React from 'react'

import SuccessFailure from 'components/SuccessFailure'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'

export type TransactionFailureRouteProp = RouteProp<
  MainStackParams,
  'TransactionFailure'
>

export type TransactionFailureScreenProps = {
  // TODO: this was `sentTransaction.error`
  readonly errorMessage: string
}

const TransactionFailure = React.memo(
  function FailureTransaction(): JSX.Element {
    const navigation = useMainNavigation()

    const { errorMessage } = useParams<TransactionFailureScreenProps>()

    const error = errorMessage.includes('INSUFFICIENT_FUNDS')
      ? 'Not enough funds for the transaction and/or the gas fees.'
      : errorMessage.includes('REPLACEMENT_UNDERPRICED')
        ? 'There is a pending transaction and the gas fee specified is not high enough to replace the pending transaction.'
        : errorMessage

    const titleText = 'Ooops..'
    const descriptionText = `Transaction failed: ${error}`
    const buttonLabel = 'Back'

    return (
      <SuccessFailure
        failure
        titleText={titleText}
        descriptionText={descriptionText}
        buttonLabel={buttonLabel}
        actionButtonOnPress={() => navigation.goBack()}
      />
    )
  }
)

export default TransactionFailure

//const mapStateToProps = (state) => {
//  return {
//    sentTransaction: selectSentTransaction(state),
//  }
//}
//
//export default connect(mapStateToProps)(FailureTransaction)
