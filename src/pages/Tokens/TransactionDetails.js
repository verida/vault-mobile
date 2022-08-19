import { Container, Icon } from 'native-base'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { getTokenChain, getTokenChainReference } from 'wallet/helpers/tokens'

import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import TestnetWarning from 'components/Tokens/TestnetWarning'
import TransactionInfo from 'components/Tokens/TransactionInfo'
import { selectTokens } from 'reduxStore/tokens/selectors'
import { getTransactionDetails } from 'reduxStore/wallet/actions'
import { selectTransactionData } from 'reduxStore/wallet/selectors'

const TransactionDetails = ({
  navigation,
  route,
  data,
  onGetTransactionDetails,
  tokens,
}) => {
  const { id, token } = route.params
  console.log(token, 'token')
  useEffect(() => {
    async function init() {
      onGetTransactionDetails(id, token)
    }

    init()
  }, [id, onGetTransactionDetails, token])

  const { transaction, loading } = data

  const tokenChain = getTokenChain(token.asset)
  console.log(tokenChain, 'tokenChain')

  const tokenChainRef = getTokenChainReference(token.asset)
  console.log(tokenChainRef, 'tokenChainRef')

  let networkReference = token.networkLabel

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
          token={token}
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
    onGetTransactionDetails: (id, token) =>
      dispatch(getTransactionDetails(id, token)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetails)
