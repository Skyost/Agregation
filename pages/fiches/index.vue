<script setup lang="ts">
import type { Sheet } from '~/types'
import SheetCard from '~/components/Cards/SheetCard.vue'

const querySheets = () => queryContent<Sheet>('latex', 'fiches')
  .sort({ 'page-name-search': 1 })
  .without(['body'])
  .find()

const route = useRoute()
const { error, pending, data: sheets } = useLazyAsyncData(route.path, querySheets)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
</script>

<template>
  <div>
    <page-head title="Liste des fiches" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="sheets">
      <h1>Liste des fiches</h1>
      <cards :items="sheets" :search-fields="['name', 'summary']">
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
