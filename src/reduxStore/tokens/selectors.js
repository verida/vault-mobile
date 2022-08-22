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
  const list = []
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      const { tokens, ...chainToken } = singleToken

      list.push(chainToken)

      Object.values(tokens).forEach((singleSubToken) => {
        let addedSlug = {
          slug: chainToken.slug,
          networkLabel: chainToken.networkLabel,
          explorerURL: chainToken.explorerURL,
          ...singleSubToken,
        }
        list.push(addedSlug)
      })
    })
  }
  return list
}

export const selectChains = (state) => {
  const rawTokens = selectRawTokens(state)
  const list = {}
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      list[singleToken.slug] = {
        data: singleToken.asset.chainId,
        slug: singleToken.slug,
        path: singleToken.path,
      }
    })
  }

  return list
}
