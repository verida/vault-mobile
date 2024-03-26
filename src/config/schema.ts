import { z } from 'zod'

export const EnvVarsSchema = z
  .object({
    // Devnet
    VERIDA_DEVNET_RPC_URL: z.string().url(),
    VERIDA_DEVNET_NOTIFICATION_SERVER_URL: z.string().url(),
    VERIDA_DEVNET_DATA_CONNECTOR_URL: z.string().url(),
    VERIDA_DEVNET_META_TRANSACTION_SERVER_URL: z.string().url(),

    // Testnet
    VERIDA_TESTNET_RPC_URL: z.string().url(),
    VERIDA_TESTNET_NOTIFICATION_SERVER_URL: z.string().url(),
    VERIDA_TESTNET_DATA_CONNECTOR_URL: z.string().url(),
    VERIDA_TESTNET_META_TRANSACTION_SERVER_URL: z.string().url(),

    // Mainnet
    VERIDA_MAINNET_RPC_URL: z.string().url(),
    VERIDA_MAINNET_NOTIFICATION_SERVER_URL: z.string().url(),
    VERIDA_MAINNET_DATA_CONNECTOR_URL: z.string().url(),
    VERIDA_MAINNET_META_TRANSACTION_SERVER_URL: z.string().url(),

    // Verida Wallet
    VERIDA_WALLET_PROVIDER_URL: z.string().url(),
    VERIDA_WALLET_PROVIDER_V2_URL: z.string().url(),

    // Blockchain
    INFURA_API_KEY: z.string(),
    IPFS_GATEWAY_URL: z.string().url(),

    // Polygon ID
    POLYGON_ID_TESTNET_RPC_URL: z.string().url(),
    POLYGON_ID_MAINNET_RPC_URL: z.string().url(),
    POLYGON_ID_REVOCATION_BASE_URL: z.string().url(),
    POLYGON_ID_CIRCUITS_DOWNLOAD_URL: z.string().url(),

    // WalletConnect
    WALLETCONNECT_PROJECT_ID: z.string(),
    WALLETCONNECT_RELAY_URL: z.string().url(),

    // Telemetry
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    HIDE_STACK_TRACES_IN_LOG: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'false'),
    ENABLE_SENTRY: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().default('local'),

    // Dev
    DISABLE_LOG_BOX: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
    ENABLE_CLIPBOARD_IN_QR_CODE_SCANNER: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  })
  .passthrough()
