const _ = require('lodash')

/**
 *
 */
export class CredentialHelper {
  /**
   * Take an existing database item with an embedded credential
   * and return the URI to a public credential.
   *
   * Always creates a new public credential.
   *
   * @todo implement purge() to *really* delete all deleted public creds when they expire
   *
   * @param {*} app
   * @param {*} item
   * @param options
   */
  static async issuePublicCredential (app, item, options) {
    const defaults = {
      encrypt: true,
      key: app.Helpers.encryption.Helpers.encryption.randomKey(),
      permissions: {
        read: 'public',
        write: 'owner'
      }
    }

    options = _.merge(defaults, options)
    options = _.merge({
      schema: options.encrypt ? 'https://schemas.verida.io/credential/public/encrypted/schema.json' : 'https://schemas.verida.io/credential/public/default/schema.json'
    }, options)

    let publicCredentials = await app.openDatastore(options.schema, {
      permissions: options.permissions
    })

    delete item['_rev']

    if (options.encrypt) {
      let content = app.Helpers.encryption.symEncrypt(item.didJwtVc, options.key)
      item = {
        content: content,
        schema: options.schema
      }
    }

    let result = await publicCredentials.save(item)
    let vid = await app.user.getAppVid()

    return {
      item: item,
      uri: CredentialHelper.getCredentialUri(vid, result.id, { key: options.key })
    }
  }

  static getCredentialUri (did, itemId, params) {
    let uri = 'verida://' + did + '/credential_public/' + itemId

    let encryptionKey = Buffer.from(params.key).toString('hex')
    if (params && params.key) {
      uri += '?key=' + encryptionKey
    }

    return uri
  }
}
