import { BigNumber } from 'ethers'

// HACK: This is equal Ethereum and Near:
//       https://docs.near.org/concepts/basics/transactions/gas-advanced#ballpark-comparisons-to-ethereum
export const GAS_TO_TRANSFER_NATIVE_CURRENCY = BigNumber.from(21_000)
