<script setup lang="ts">
import type { Ranking } from '~/types'
import RankingCard from '~/components/Cards/RankingCard.vue'

const queryRankings = () => queryContent<Ranking>('latex', 'historique')
  .sort({ 'page-name-search': -1 })
  .without(['body'])
  .find()

const route = useRoute()
const { error, pending, data: rankings } = useLazyAsyncData<Ranking[]>(route.path, queryRankings)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)

usePageHead({ title: 'Historique des admissions' })
</script>

<template>
  <div>
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="rankings">
      <h1>Historique des admis à l'agrégation externe</h1>
      <cards
        input-id="rankings-search-field"
        :items="rankings"
        :search-fields="['name', 'summary']"
      >
        <template #default="slotProps">
          <ranking-card :ranking="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
