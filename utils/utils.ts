import * as crypto from 'crypto'
import * as path from 'path'

export const removeTrailingSlashIfPossible = (string: string) => string.endsWith('/') ? string.substring(0, string.length - 1) : string

export const getFileName = (file: string) => path.parse(file).name

export const normalizeString = (string: string) => {
  return string.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export const generateChecksum = (string: string) => crypto
  .createHash('md5')
  .update(string, 'utf8')
  .digest('hex')

export const getNested = (obj: Object, ...args: any[]) => args.reduce((obj, level) => obj && obj[level], obj)
