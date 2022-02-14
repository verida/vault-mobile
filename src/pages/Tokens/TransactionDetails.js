import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import { getTransactionDetails } from 'reduxStore/wallet/actions'
import { selectTransactionData } from 'reduxStore/wallet/selectors'

const TransactionDetails = ({
  navigation,
  route,
  data,
  onGetTransactionDetails,
}) => {
  const { id } = route.params
  useEffect(() => {
    async function init() {
      onGetTransactionDetails(id)
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
    onGetTransactionDetails: (id) => dispatch(getTransactionDetails(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetails)
