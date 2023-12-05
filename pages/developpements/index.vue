<script setup lang="ts">
import type { Development } from '~/types'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'

const queryDevelopments = () => queryContent<Development>('latex', 'developpements')
  .sort({ 'page-name-search': 1 })
  .without(['body'])
  .find()

const route = useRoute()
const { error, pending, data: developments } = useLazyAsyncData(route.path, queryDevelopments)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
</script>

<template>
  <div>
    <page-head title="Liste des développements" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="developments">
      <h1>Liste des développements</h1>
      <cards :items="developments" :search-fields="['name']">
        <template #default="slotProps">
          <development-card :development="slotProps.item" />
        </template>
      </cards>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
