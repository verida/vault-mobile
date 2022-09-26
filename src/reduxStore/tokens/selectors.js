export const selectTokensData = (state) => state.tokens || {}

export const selectTokensTimestamp = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.timeFetched
}

export const selectRawTokens = (state) => {
  const tokensData = selectTokensData(state)
  return tokensData.data
}

const createIdentifier = (chainId) => {
  return `${chainId.namespace}:${chainId.reference}`
}

export const selectTokens = (state) => {
  const rawTokens = selectRawTokens(state)
  const list = []
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      const { tokens, ...chainToken } = singleToken

      const identifier = createIdentifier(chainToken.asset.chainId)

      list.push({ identifier: identifier, ...chainToken })

      Object.values(tokens).forEach((singleSubToken) => {
        let addedInfo = {
          identifier: identifier,
          addressMap: chainToken.addressMap,
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

export const selectChains = (state) => {
  const rawTokens = selectRawTokens(state)
  const list = {}
  if (rawTokens) {
    rawTokens.forEach((singleToken) => {
      const identifier = createIdentifier(singleToken.asset.chainId)
      list[identifier] = {
        identifier: identifier,
        data: singleToken.asset.chainId,
        addressMap: singleToken.addressMap,
        path: singleToken.derivationPath,
        name: singleToken.name,
        icon: singleToken.icon,
      }
    })
  }

  return list
}
