import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { store } from 'reduxStore'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import {
  getBlockchainNetwork,
  getBlockchainNetworkLabel,
} from 'reduxStore/selectors'
import { getTransactionDetails } from 'reduxStore/wallet/actions'
import { selectTransactionData } from 'reduxStore/wallet/selectors'

const TransactionDetails = ({
  navigation,
  route,
  data,
  onGetTransactionDetails,
}) => {
  const { id, token } = route.params
  useEffect(() => {
    async function init() {
      onGetTransactionDetails(id, token)
    }

    init()
  }, [id, onGetTransactionDetails, token])

  const { transaction, loading } = data
  const network = getBlockchainNetwork(store.getState(), token.asset.chainId)
  let networkReference = getBlockchainNetworkLabel(network)

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={'Transaction Details'}
      />
      <TestnetWarning networkReference={networkReference} />
      {loading ? (
        <LoadingIndicator />
      ) : (
        <TransactionInfo transaction={transaction} token={token} />
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
    onGetTransactionDetails: (id, token) =>
      dispatch(getTransactionDetails(id, token)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetails)
