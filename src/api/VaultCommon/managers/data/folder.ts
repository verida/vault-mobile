import _ from 'lodash'

import VaultCommon from '../../vault'

export default class Folder {
  private vaultCommon: VaultCommon
  private db: any

  public config: any

  constructor(vaultCommon: VaultCommon, config: any) {
    this.vaultCommon = vaultCommon
    this.config = config
    this.db = null
  }

  public async init() {
    if (this.config.database) {
      this.db = await this.vaultCommon.vault.openDatabase(this.config.database)
    }
  }

  public async getDb() {
    await this.init()
    return this.db
  }

  /**
   * Get a list of database results for this folder
   *
   * @param {*} filter
   * @param {*} options
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async getMany<T extends object = object>(
    filter: any = {},
    options: any = {}
  ): Promise<T[]> {
    await this.init()
    if (!this.db) {
      return []
    }

    const defaults: any = {}

    // support default sort defined in map.json
    if (this.config.sort) {
      defaults.sort = this.config.sort
    }

    options = _.merge(defaults, options)

    let results = []
    try {
      results = await this.db.getMany(filter, options)
    } catch (err: any) {
      // If the error is caused by a missing index, automatically create the index and try again
      if (err.message?.indexOf('default index')) {
        const matches = err.message?.match(
          // eslint-disable-next-line no-useless-escape
          /Cannot sort on field\(s\) \"([0-9a-zA-Z\.-]+)\" when using the default index/
        )
        const missingIndexName = matches[1]
        const couchDb = await this.db.getDb()
        await couchDb.createIndex({
          name: missingIndexName,
          fields: [missingIndexName],
        })

        // try to fetch restuls again with index
        results = await this.getMany()
      }
    }

    return results
  }

  /**
   * Get a specific row for this database along with metadata
   * to help with displaying the row.
   *
   * @param {*} id
   */
  public async getDetail(rowOrId: any, schemaUri?: string) {
    await this.init()

    let row
    if (typeof rowOrId === 'string') {
      row = await this.db.get(rowOrId)
    } else {
      row = rowOrId
    }

    // TODO: Handle when it's a credential without a credentialSchema property. It is irrelevant to use the schema of the record. So should handle iterating over the item keys
    if (!schemaUri) {
      schemaUri = row.schema
    }

    // TODO: Need to handle nested objects

    const schema = await this.vaultCommon.client.getSchema(schemaUri)
    const json = await schema.getSchemaJson()
    const layouts = json.layouts

    // If the schema is a credential schema with a 'credentialSubject' property, then use it. Otherwise use all the properties.
    let properties = json.properties.credentialSubject
      ? json.properties.credentialSubject.properties
      : json.properties

    if (json.allOf) {
      // This only gets the lst list of properties.. although schemas should
      // define layouts.view so it doesn't matter
      // TODO: May need to to fetch referenced schema to get all properties as we can't rely on layouts definition (+ layout won't give the label of the properties)
      properties = json.allOf[json.allOf.length - 1].properties
    }

    let viewAttributes = []
    if (layouts && layouts.view) {
      viewAttributes = layouts.view
    } else {
      viewAttributes = Object.keys(properties)
    }

    const displayData = this.buildDisplayData(row, viewAttributes, properties)
    const cardDetail = this.getCardDetail(row)

    return {
      data: displayData,
      row: row,
      layouts: layouts,
      title: json.title,
      titlePlural: json.titlePlural,
      cardDetail: cardDetail,
      titleField: cardDetail.name,
    }
  }

  /**
   * Get the title for a row (respects config.nameField).
   *
   * @todo: Move support for this into schema definitions
   *
   * @param row
   */
  public getCardDetail(row: any) {
    let name = ''
    let summary = ''

    if (this.config.nameField) {
      // Use name field if specified
      name = _.get(row, this.config.nameField)
    } else if (this.config.card && this.config.card.name) {
      // Use card config if specified
      name = this.config.card.name(row)
    } else {
      // Fallback to using name
      name = row.name
    }

    if (this.config.summaryField) {
      // Use name field if specified
      summary = _.get(row, this.config.summaryField)
    } else if (this.config.card && this.config.card.summary) {
      // Use card config if specified
      summary = this.config.card.summary(row)
    } else {
      // Fallback to using summary
      summary = row.summary
    }

    return {
      name,
      summary,
    }
  }

  public getLabel(fieldName: string) {
    if (
      this.config.fields &&
      this.config.fields[fieldName] &&
      this.config.fields[fieldName].label
    ) {
      return this.config.fields[fieldName].label
    }

    const matches = fieldName.match(/[A-Z]*[^A-Z]+/g)
    if (!matches) {
      return
    }

    return matches
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  ///**
  // * Build headers for the fields being displayed
  // */
  //public buildHeaders() {
  //  const headers: object[] = []
  //  const folder = this

  //  this.config.layouts.list.forEach((item: any) => {
  //    headers.push({
  //      value: item,
  //      text: folder.getLabel(item),
  //    })
  //  })

  //  return headers
  //}

  // Build display data for a given row
  // Field = Field label
  // Value = Value from the row
  public buildDisplayData(data: any, layout: any, properties: any[]) {
    const displayData: Record<string, unknown>[] = []

    layout.forEach((item: any) => {
      const value = _.get(data, item)

      displayData.push({
        field: properties[item]?.title || this.getLabel(item),
        value: value,
      })
    })

    return displayData
  }
}
