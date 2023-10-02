<script setup lang="ts">
import type { Development } from '~/types'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'

const route = useRoute()
const { pending, data: developments } = useLazyAsyncData(
  () => queryContent<Development>('developpements')
    .sort({ 'page-title-search': 1 })
    .only(['name', 'slug', 'page-title', 'page-title-search', 'categories', 'summary', 'page-description'])
    .find()
)

usePdfBanner(`/pdf${route.path}.pdf`)
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
      <error-display :error="500" />
    </div>
  </div>
</template>
