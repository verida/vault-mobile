import { selectSentTransaction } from 'features/wallets'
import React from 'react'
import { connect } from 'react-redux'

import SuccessFailure from 'components/SuccessFailure'

const FailureTransaction = ({ navigation, sentTransaction }) => {
  const titleText = 'Ooops..'
  const descriptionText = `Transaction failed: ${sentTransaction.error}`
  const buttonLabel = 'Back'

  return (
    <SuccessFailure
      failure={true}
      titleText={titleText}
      descriptionText={descriptionText}
      buttonLabel={buttonLabel}
      actionButtonOnPress={() => navigation.goBack()}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    sentTransaction: selectSentTransaction(state),
  }
}

export default connect(mapStateToProps)(FailureTransaction)
