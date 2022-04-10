const local = {} as any

export function setLocal(key: string, data: any) {
  const jsonData = JSON.stringify(data)
  if (local) {
    local[key] = jsonData
  }
}

export function getLocal(key: string) {
  let data = null
  let raw = null
  if (local) {
    raw = local[key]
  }
  if (raw && typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch (error) {
      return null
    }
  }
  return data
}

export function removeLocal(key: string) {
  if (local) {
    delete local[key]
  }
}

export function updateLocal(key: string, data: any) {
  const localData = getLocal(key) || {}
  const mergedData = { ...localData, ...data }
  setLocal(key, mergedData)
}
