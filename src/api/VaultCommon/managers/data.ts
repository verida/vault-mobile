import VaultCommon from '../vault'
import Folder from './data/folder'

export class DataManager {
  private vaultCommon: VaultCommon
  private currentFolder: Folder | null = null

  public map: any

  constructor(vaultCommon: VaultCommon, map: any) {
    this.vaultCommon = vaultCommon
    this.map = map
  }

  // TODO: Remove this.
  //public getFolderList() {
  //  const { navigation, folders } = this.map

  //  return navigation.map((folder: string) => {
  //    const { title, titlePlural, icon } = folders[folder]
  //    console.log('icon', icon)
  //    return {
  //      title: titlePlural || title,
  //      folder,
  //      icon,
  //    }
  //  })
  //}

  public async selectFolder(folder: string) {
    const { folders } = this.map
    if (!folders[folder]) {
      throw new Error('Invalid folder specified: ' + folder)
    }

    this.closeFolder()
    this.currentFolder = new Folder(this.vaultCommon, folders[folder])
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
