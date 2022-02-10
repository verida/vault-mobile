import React, { useEffect } from 'react'
import { Container, Icon } from 'native-base'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import LoadingIndicator from 'components/LoadingIndicator'
import TransactionInfo from 'components/Tokens/TransactionInfo'

import { getTransactionDetails } from 'reduxStore/wallet/actions'
import { selectTransactionData } from 'reduxStore/wallet/selectors'

const TransactionDetails = ({
  navigation,
  route,
  data,
  onGetTransactionDetails,
}) => {
  const { id, tokenAddress } = route.params
  useEffect(() => {
    async function init() {
      onGetTransactionDetails(id, tokenAddress)
    }

    init()
  }, [id, onGetTransactionDetails])

  const { transaction, loading } = data

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Transaction Details'}
      />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo transaction={transaction} />
      )}
    </Container>
  )
}

const mapStateToProps = (state) => {
  return {
    data: selectTransactionData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetTransactionDetails: (id, tokenAddress) =>
      dispatch(getTransactionDetails(id, tokenAddress)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetails)
