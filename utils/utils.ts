import * as crypto from 'crypto'
import * as path from 'path'

export const removeTrailingSlashIfPossible = (string: string) => string.endsWith('/') ? string.substring(0, string.length - 1) : string

export const getFileName = (file: string) => {
  const extension = file.substring(file.lastIndexOf('.'))
  return path.basename(file.substring(0, file.length - extension.length))
}

export const normalizeString = (string: string) => {
  return string.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export const generateChecksum = (string: string) => crypto
  .createHash('md5')
  .update(string, 'utf8')
  .digest('hex')
