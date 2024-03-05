import { Context } from '@verida/client-rn'
import { DatabaseOpenConfig, DatastoreOpenConfig } from '@verida/types'
import { Logger } from 'features/telemetry'

import { PolygonIdVeridaDataSource } from './PolygonIdVeridaDataSource'
import { PolygonIdVeridaMerkleTreeDataSource } from './PolygonIdVeridaMerkleTreeDataSource'

const logger = Logger.create('PolygonId')

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
export async function buildPolygonIdVeridaDataSource<T>(
  context: Context,
  databaseName: string
) {
  logger.debug(`Building Verida data source for ${databaseName}...`)
  const db = await getVeridaDatabase(context, databaseName)
  return new PolygonIdVeridaDataSource<T>(db)
}

/**
 * Creates a new data source based on a Verida database.
 *
 * @param context The Verida Context
 * @param databaseName the name of the database for the datasource
 * @returns the datasource
 */
export async function buildPolygonIdVeridaMerkleTreeDataSource(
  context: Context,
  databaseName: string
) {
  logger.debug(`Building Verida data source for ${databaseName}...`)
  const db = await getVeridaDatabase(context, databaseName)
  return new PolygonIdVeridaMerkleTreeDataSource(db)
}
