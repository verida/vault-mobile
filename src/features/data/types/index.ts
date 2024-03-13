import { VeridaRecord } from 'features/verida'

export type DataField = {
  field: string
  value: unknown
}

export type DataItem = {
  data: DataField[]
  title: string
}

export type DataFolderDisplayType = 'grid' | 'folders' | 'cards'

export type DataFolderDefinition = {
  name: string
  title: string
  titlePlural?: string
  icon: React.ReactNode
  color?: string
  root: boolean
} & (
  | {
      display: 'folders'
      folders: string[]
    }
  | {
      display: 'grid' | 'cards'
      database: string
      layouts?: {
        list?: string[]
        view?: string[]
      }
      sort?: Record<string, unknown>[]
      fields?: {
        [key: string]: {
          label: string
        }
      }
      card?: {
        name?: (record: VeridaRecord) => string
        summary?: (record: VeridaRecord) => string
      }
      nameField?: string
      summaryField?: string
    }
)
