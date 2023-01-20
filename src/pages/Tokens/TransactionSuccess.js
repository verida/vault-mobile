import React from 'react'
import { connect } from 'react-redux'
import { formatTokenQuantity } from 'wallet/helpers/tokens'

import SuccessFailure from 'components/SuccessFailure'
import { selectSentTransaction } from 'reduxStore/wallet/selectors'

const TransactionSuccess = ({ navigation, sentTransaction }) => {
  const { data } = sentTransaction
  const { amount, token, to } = data
  const titleText = 'Success!'
  const descriptionText = `${formatTokenQuantity(amount, token.decimal)} ${
    token.symbol
  } sent to ${to}`
  const buttonLabel = 'Done'

  return (
    <SuccessFailure
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

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    sentTransaction: selectSentTransaction(state),
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSuccess)
