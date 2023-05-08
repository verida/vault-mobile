import React from 'react'
import { connect } from 'react-redux'

import SuccessFailure from 'components/SuccessFailure'
import { selectSentTransaction } from 'reduxStore/wallet/selectors'

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

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    sentTransaction: selectSentTransaction(state),
  }
}

export default connect(mapStateToProps)(FailureTransaction)
