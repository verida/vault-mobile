import type { JSONObject } from '@0xpolygonid/js-sdk'

const ZK_QUERY_OPERATORS = {
  $eq: 'is',
  $ne: 'is not',
  $lt: 'is smaller than',
  $gt: 'is bigger than',
  $in: 'is among',
  $nin: 'is not among',
}

type QueryOperator = keyof typeof ZK_QUERY_OPERATORS

function isQueryOperator(operator: string): operator is QueryOperator {
  return Object.keys(ZK_QUERY_OPERATORS).includes(operator)
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  return value
}

export function getUserFriendlyProofRequestRequirements(query: JSONObject) {
  try {
    const credentialSubject = query.credentialSubject as
      | Record<string, unknown>
      | undefined

    if (credentialSubject === undefined) {
      throw new Error('No credentialSubject proeprty in proof request')
    }

    const result: string[] = []
    for (const property in credentialSubject) {
      const conditions = credentialSubject[property] as Record<string, unknown>
      if (Object.keys(conditions).length === 0) {
        // Selective disclosure
        result.push(`Has ${property} (value will be disclosed)`)
        continue
      }
      for (const operator in conditions) {
        if (isQueryOperator(operator)) {
          const value = formatValue(conditions[operator])
          const operatorMessage = ZK_QUERY_OPERATORS[operator]
          result.push(`${property} ${operatorMessage} ${value}`)
        } else {
          result.push(`${property} ${JSON.stringify(conditions[operator])}`)
        }
      }
    }
    return result
  } catch (_error: unknown) {
    return [JSON.stringify(query)]
  }
}

export function getUserFriendlyAllowedIssuers(allowedIssuers?: string[]) {
  if (allowedIssuers === undefined) {
    return []
  }
  return allowedIssuers.map((issuer) => (issuer === '*' ? 'Any' : issuer))
}
