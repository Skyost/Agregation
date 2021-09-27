function normalizeString (string) {
  return string.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export { normalizeString }
