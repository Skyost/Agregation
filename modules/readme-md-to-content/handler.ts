import { storageKey, filename } from './common'

export default defineEventHandler(async () => {
  const json = await useStorage(`assets:${storageKey}`).getItem(filename)
  if (!json) {
    throw createError({ status: 404 })
  }
  return json
})
