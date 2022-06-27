import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { getTokenChain } from 'wallet/helpers/tokens'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import { getTransactionDetails } from 'reduxStore/wallet/actions'
import { selectTransactionData } from 'reduxStore/wallet/selectors'
import { selectTokens } from 'reduxStore/tokens/selectors'

const TransactionDetails = ({
  navigation,
  route,
  data,
  onGetTransactionDetails,
  tokens,
}) => {
  const { id, tokenAddress } = route.params
  useEffect(() => {
    async function init() {
      onGetTransactionDetails(id, tokenAddress)
    }

    init()
  }, [id, onGetTransactionDetails, tokenAddress])

  const { transaction, loading } = data
  const tokenChain = getTokenChain(tokenAddress)
  let networkReference = tokenChain === 'eip155' ? 'Rinkeby' : ''

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
        <TransactionInfo
          transaction={transaction}
          tokenAddress={tokenAddress}
          tokens={tokens}
        />
      )}
    </Container>
  )
}

const mapStateToProps = (rootState) => {
  const state = rootState.main
  return {
    data: selectTransactionData(state),
    tokens: selectTokens(rootState),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onGetTransactionDetails: (id, tokenAddress) =>
      dispatch(getTransactionDetails(id, tokenAddress)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetails)
