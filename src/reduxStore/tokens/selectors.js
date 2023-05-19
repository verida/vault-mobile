export const selectTokensData = (state) => state.tokens || {}

export const selectTokensTimestamp = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.timeFetched
}

// @todo: remove, no longer required
export const selectRawTokens = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.data
}

// @todo: remove, no longer required
export const selectTokens = (state) => {
  const rawTokens = selectRawTokens(state)
  const list = []
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      const { tokens, ...chainToken } = singleToken

      list.push({
        addressMapping: singleToken.asset.chainId.namespace,
        ...chainToken,
      })

      Object.values(tokens).forEach((singleSubToken) => {
        let addedInfo = {
          addressMapping: chainToken.asset.chainId.namespace,
          chainName: chainToken.chainName,
          referenceLabel: chainToken.referenceLabel,
          explorerURL: chainToken.explorerURL,
          ...singleSubToken,
        }
        list.push(addedInfo)
      })
    })
  }

  return list
}

// @todo: remove, use getBlockchainNetworks()
export const selectChains = (state) => {
  const rawTokens = selectRawTokens(state)
  const list = {}
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      list[singleToken.chainName] = {
        data: singleToken.asset.chainId,
        addressMapping: singleToken.asset.chainId.namespace,
        path: singleToken.derivationPath,
        name: singleToken.name,
        icon: singleToken.icon,
        chainName: singleToken.chainName,
      }
    })
  }

  return list
}
