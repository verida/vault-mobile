import { dataFolders } from 'features/data'

import VaultCommon from '../vault'
import Folder from './data/folder'

export class DataManager {
  private vaultCommon: VaultCommon
  private currentFolder: Folder | null = null

  constructor(vaultCommon: VaultCommon) {
    this.vaultCommon = vaultCommon
  }

  public async selectFolder(folderName: string) {
    const folderDefinition = dataFolders.find(
      (folder) => folder.name === folderName
    )

    if (!folderDefinition) {
      throw new Error('Invalid folder specified: ' + folderName)
    }

    this.closeFolder()
    this.currentFolder = new Folder(this.vaultCommon, folderDefinition)
    await this.currentFolder!.init()

    return this.currentFolder
  }

  public folder() {
    if (!this.currentFolder) {
      throw new Error('No folder selected')
    }

    return this.currentFolder
  }

  public closeFolder() {
    if (this.currentFolder) {
      this.currentFolder = null
    }
  }
}
