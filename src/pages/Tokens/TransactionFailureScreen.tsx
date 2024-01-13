import React from 'react'

import SuccessFailure from 'components/SuccessFailure'
import { MainStackScreenProps } from 'navigation/types'

export type TransactionFailureScreenParams = {
  // TODO: this was `sentTransaction.error`
  readonly errorMessage: string
}

type TransactionFailureScreenProps = MainStackScreenProps<'TransactionFailure'>

export const TransactionFailureScreen: React.FC<TransactionFailureScreenProps> =
  (props) => {
    const {
      navigation,
      route: { params },
    } = props
    const { errorMessage } = params

    const titleText = 'Ooops..'
    const descriptionText = `Transaction failed: ${errorMessage}`
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
