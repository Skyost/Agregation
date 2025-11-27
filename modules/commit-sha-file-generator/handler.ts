import { storageKey, filename } from './common'

export default defineEventHandler(async () => {
  return await useStorage(`assets:${storageKey}`).getItem(filename)
})
