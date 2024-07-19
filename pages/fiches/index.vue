<script setup lang="ts">
import type { Sheet } from '~/types'
import SheetCard from '~/components/Cards/SheetCard.vue'

const querySheets = () => queryContent<Sheet>('latex', 'fiches')
  .sort({ 'page-name-search': 1 })
  .without(['body'])
  .find()

const route = useRoute()
const { error, pending, data: sheets } = useLazyAsyncData<Sheet[]>(route.path, querySheets)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)

usePageHead({ title: 'Liste des fiches' })
</script>

<template>
  <div>
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="sheets">
      <h1>Liste des fiches</h1>
      <cards
        input-id="sheet-search-field"
        :items="sheets"
        :search-fields="['name', 'summary']"
      >
        <template #default="slotProps">
          <sheet-card :sheet="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
