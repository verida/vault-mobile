import {
  formatTokenQuantity,
  selectSentTransaction,
} from 'features/cryptoWallet'
import React from 'react'
import { connect } from 'react-redux'

import SuccessFailure from 'components/SuccessFailure'

const TransactionSuccess = ({ navigation, sentTransaction }) => {
  const { data } = sentTransaction
  const { amount, token, to } = data
  const titleText = 'Success!'

  const blockchainNetwork = data.chain

  const transferQuantity = formatTokenQuantity(
    amount,
    blockchainNetwork.decimal
  )

  const descriptionText = `${transferQuantity} ${token.symbol} sent to ${to}`
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

const mapStateToProps = (state) => {
  return {
    sentTransaction: selectSentTransaction(state),
  }
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSuccess)
