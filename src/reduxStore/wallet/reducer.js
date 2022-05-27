import {
  ADD_PENDING_TRANSACTION,
  BALANCES_FETCH_FAILED,
  BALANCES_FETCH_START,
  CURRENCIES_FETCH_FAILED,
  CURRENCIES_FETCH_START,
  FETCHED_BALANCES,
  FETCHED_CURRENCIES,
  FETCHED_TRANSACTION_DETAIL,
  FETCHED_TRANSACTION_PARAMS,
  FETCHED_TRANSACTIONS,
  REMOVE_USER_WALLETS,
  SEND_TRANSACTION_FAILED,
  SEND_TRANSACTION_START,
  SEND_TRANSACTION_SUCCESS,
  SET_SELECTED_WALLET,
  SET_USER_WALLETS,
  TRANSACTION_DETAIL_FETCH_FAILED,
  TRANSACTION_DETAIL_FETCH_START,
  TRANSACTION_PARAMS_FETCH_FAILED,
  TRANSACTION_PARAMS_FETCH_START,
  TRANSACTIONS_FETCH_FAILED,
  TRANSACTIONS_FETCH_START,
  WALLET_PROCESSING_FAILED,
  WALLET_PROCESSING_FINISHED,
  WALLET_PROCESSING_START,
} from './types'

const initialState = {
  pricing: {
    data: [],
    fetching: false,
    error: undefined,
  },
  balances: {
    data: {},
    fetching: false,
    error: undefined,
  },
  transactions: {
    data: [],
    fetching: false,
    error: undefined,
  },
  transactionParams: {
    data: {},
    fetching: false,
    error: undefined,
  },
  sentTransaction: {
    data: {},
    fetching: false,
    error: undefined,
  },
  transactionDetails: {
    data: null,
    fetching: false,
    error: undefined,
  },
  pendingTransactions: {
    data: [],
  },
  wallets: { data: {} },
  selectedWallet: null,
  walletProcessing: {
    loading: false,
    error: undefined,
  },
}

export const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case CURRENCIES_FETCH_START:
      return {
        ...state,
        pricing: { fetching: true, error: undefined, data: [] },
      }
    case FETCHED_CURRENCIES:
      return {
        ...state,
        pricing: { fetching: false, error: undefined, data: action.data },
      }
    case CURRENCIES_FETCH_FAILED:
      return {
        ...state,
        pricing: { fetching: false, error: action.error, data: [] },
      }

    case BALANCES_FETCH_START:
      return {
        ...state,
        balances: { fetching: true, error: undefined, data: {} },
      }
    case FETCHED_BALANCES:
      return {
        ...state,
        balances: { fetching: false, error: undefined, data: action.data },
      }
    case BALANCES_FETCH_FAILED:
      return {
        ...state,
        balances: { fetching: false, error: action.error, data: {} },
      }

    case TRANSACTIONS_FETCH_START:
      return {
        ...state,
        transactions: { fetching: true, error: undefined, data: [] },
      }
    case FETCHED_TRANSACTIONS:
      return {
        ...state,
        transactions: { fetching: false, error: undefined, data: action.data },
      }
    case TRANSACTIONS_FETCH_FAILED:
      return {
        ...state,
        transactions: { fetching: false, error: action.error, data: [] },
      }

    case TRANSACTION_PARAMS_FETCH_START:
      return {
        ...state,
        transactionParams: { fetching: true, error: undefined, data: {} },
      }
    case FETCHED_TRANSACTION_PARAMS:
      return {
        ...state,
        transactionParams: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case TRANSACTION_PARAMS_FETCH_FAILED:
      return {
        ...state,
        transactions: { fetching: false, error: action.error, data: {} },
      }

    case SEND_TRANSACTION_START:
      return {
        ...state,
        sentTransaction: { fetching: true, error: undefined, data: {} },
      }
    case SEND_TRANSACTION_SUCCESS:
      return {
        ...state,
        sentTransaction: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case SEND_TRANSACTION_FAILED:
      return {
        ...state,
        sentTransaction: { fetching: false, error: action.error, data: {} },
      }

    case TRANSACTION_DETAIL_FETCH_START:
      return {
        ...state,
        transactionDetails: { fetching: true, error: undefined, data: null },
      }
    case FETCHED_TRANSACTION_DETAIL:
      return {
        ...state,
        transactionDetails: {
          fetching: false,
          error: undefined,
          data: action.data,
        },
      }
    case TRANSACTION_DETAIL_FETCH_FAILED:
      return {
        ...state,
        transactionDetails: {
          fetching: false,
          error: action.error,
          data: null,
        },
      }

    case ADD_PENDING_TRANSACTION:
      return {
        ...state,
        pendingTransactions: {
          data: [action.data, ...state.wallet.pendingTransactions.data],
        },
      }

    case SET_USER_WALLETS:
      return {
        ...state,
        wallets: { data: action.data },
      }

    case SET_SELECTED_WALLET:
      return {
        ...state,
        selectedWallet: action.data,
      }

    case REMOVE_USER_WALLETS:
      return {
        ...initialState,
      }

    case WALLET_PROCESSING_START:
      return {
        ...state,
        walletProcessing: {
          loading: true,
          error: undefined,
        },
      }

    case WALLET_PROCESSING_FAILED:
      return {
        ...state,
        walletProcessing: {
          loading: false,
          error: action.error,
        },
      }

    case WALLET_PROCESSING_FINISHED:
      return {
        ...state,
        walletProcessing: {
          loading: false,
          error: undefined,
        },
      }

    default:
      return state
  }
}
