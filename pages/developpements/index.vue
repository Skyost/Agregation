<script setup lang="ts">
import type { Category, Development } from '~/types'
import DevelopmentCard from '~/components/Cards/DevelopmentCard.vue'
import { removeTrailingSlashIfPossible } from '~/utils/utils'

const queryDevelopments = async () => {
  return (await queryContent<Development>('developpements')
    .sort({ 'page-title-search': 1 })
    .only(['name', 'slug', 'page-title', 'page-title-search', 'categories', 'summary', 'page-description'])
    .find())
    .map((data) => {
      const development: Development = {
        name: data.name as string,
        slug: data.slug as string,
        'page-title': data['page-title'] as string,
        'page-title-search': data['page-title-search'] as string,
        categories: data.categories as Category[],
        summary: data.summary as string,
        'page-description': data['page-description'] as string
      }
      return development
    })
}

const route = useRoute()
const { pending, data: developments } = useLazyAsyncData(queryDevelopments)

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
      <error-display :error="500" />
    </div>
  </div>
</template>
