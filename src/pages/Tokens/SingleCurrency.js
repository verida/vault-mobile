import React, { useEffect } from 'react'
import { Container, List, Icon } from 'native-base'
import { connect } from 'react-redux'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import TokenBanner from 'components/Tokens/TokenBanner'
import TransactionsList from 'components/Tokens/TransactionsList'

import { getTransactionsForToken } from 'reduxStore/wallet/actions'
import { getTransactionsData } from 'reduxStore/wallet/selectors'

const SingleCurrency = ({
  navigation,
  route,
  getTransactionsForToken,
  transactions,
}) => {
  const { item } = route.params
  useEffect(() => {
    async function loadData() {
      await getTransactionsForToken(item.address)
    }

    loadData()
  }, [])

  return (
    <Container>
      <NavigationHeader
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
        title={item.label}
      />
      <TokenBanner data={item} />
      <List>
        <TransactionsList symbol={item.symbol} list={transactions} />
      </List>
    </Container>
  )
}

const mapStateToProps = (state) => {
  return {
    transactions: getTransactionsData(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getTransactionsForToken: (assetID) =>
      dispatch(getTransactionsForToken(assetID)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleCurrency)
