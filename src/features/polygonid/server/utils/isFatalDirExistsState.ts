import { Stateful } from '../../@types'

// Defines a fatal state when analysing the existence of a dir; i.e. if there's an
// error, or we've finished checking and the folder does not exist.
export function isFatalDirExistsState(dirExists: Stateful<boolean>) {
  const maybeAuthFileServerError = 'error' in dirExists && dirExists.error

  const maybeAuthFileServerDoesNotExist =
    'result' in dirExists && !dirExists.result

  return Boolean(maybeAuthFileServerError) || maybeAuthFileServerDoesNotExist
}
