import React from 'react'
import { connect } from 'react-redux'

import SuccessFailure from 'components/SuccessFailure'
import { selectSentTransaction } from 'reduxStore/wallet/selectors'

const TransactionSuccess = ({ navigation, sentTransaction }) => {
  const { data } = sentTransaction
  const { amount, token, to } = data
  const titleText = 'Success!'
  const descriptionText = `${amount / 1000000} ${token.symbol} sent to ${to}`
  const buttonLabel = 'Done'

  return (
    <SuccessFailure
      failure={false}
      titleText={titleText}
      descriptionText={descriptionText}
      buttonLabel={buttonLabel}
      actionButtonOnPress={() => navigation.navigate('Tokens')}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    sentTransaction: selectSentTransaction(state),
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSuccess)
