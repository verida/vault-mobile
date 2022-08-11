// NEAR GAS units remain the same, these are gas units
// to convert transaction into a receipt and processing transaction
// this gets multiplied by the current gas price to estimate fees
// more here: https://docs.near.org/docs/concepts/gas
export const NEAR_GAS_AMOUNT_TRANSFER = 223182562500 * 2

// Same as above but this is for a fungible token transfer
export const NEAR_GAS_AMOUNT_FUNGIBLE_TRANSFER = 2428102110654 + 5430000000000
