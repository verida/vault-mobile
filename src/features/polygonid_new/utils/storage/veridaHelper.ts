import { Context } from '@verida/client-rn'
import { DatabaseOpenConfig, DatastoreOpenConfig } from '@verida/types'

import { VeridaPolygonIdDataSource } from './VeridaPolygonIdDataSource'

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
  return context!.openDatastore(schema, config)
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
  return context.openDatabase(databaseName, config)
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
  const db = await getVeridaDatabase(context, databaseName)
  return new VeridaPolygonIdDataSource<T>(db)
}
