export const selectTokensData = (state) => state.tokens || {}

export const selectTokensTimestamp = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.timeFetched
}

export const selectRawTokens = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.data
}

export const selectTokens = (state) => {
  const rawTokens = selectRawTokens(state)
  // console.log(rawTokens, 'rawTokens')
  const list = []
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      const { tokens, ...chainToken } = singleToken

      list.push(chainToken)

      Object.values(tokens).forEach((singleSubToken) => {
        list.push(singleSubToken)
      })
    })
  }
  return list
}

export const selectChains = (state) => {
  const rawTokens = selectRawTokens(state)
  // console.log(rawTokens, 'rawTokens')
  const list = {}
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      list[
        singleToken.asset.chainId.namespace +
          ':' +
          singleToken.asset.chainId.reference
      ] = singleToken.asset.chainId
    })
  }

  return list
}
