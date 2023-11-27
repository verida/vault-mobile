import { Context, Network } from "@verida/client-ts";
import { VeridaDataSource } from "../classes";
import { AutoAccount } from "@verida/account-node";
import { VeridaConfig } from "../types";
import { DatabaseOpenConfig, DatastoreOpenConfig } from "@verida/types";

/**
 * Create a connection to the network and return the opened context
 *
 * @param config
 * @returns
 */
export function getVeridaContext(config: VeridaConfig) {
  // Create a connection to the network and return the opened context
  return Network.connect({
    context: {
      name: config.veridaContextName,
    },
    client: {
      environment: config.veridaEnvironment,
    },
    account: new AutoAccount({
      privateKey: config.veridaPrivateKey,
      environment: config.veridaEnvironment,
      didClientConfig: config.veridaDidClientConfig,
    }),
  });
}

/**
 * Open a Verida database.
 *
 * @param context The Verida context.
 * @param databaseName The name opf the database.
 * @param config Optional configuration of the database.
 * @returns The database.
 */
export function getVeridaDatabase(
  context: Context,
  databaseName: string,
  config?: DatabaseOpenConfig
) {
  return context.openDatabase(databaseName, config);
}

/**
 * Open a Verida datastore.
 *
 * @param context The Verida context.
 * @param schema The schema opf the datastore.
 * @param config Optional configuration of the datastore.
 * @returns The datastore.
 */
export function getVeridaDatastore(
  context: Context,
  schema: string,
  config?: DatastoreOpenConfig
) {
  return context!.openDatastore(schema, config);
}

/**
 * Creates a new data source based on a Verida database.
 *
 * @param context The Verida Context
 * @param databaseName the name of the database for the datasource
 * @returns the datasource
 */
export async function buildVeridaDataSource<T>(
  context: Context,
  databaseName: string
) {
  const db = await getVeridaDatabase(context, databaseName);
  return new VeridaDataSource<T>(db);
}

