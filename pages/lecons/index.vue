<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { Category, Lesson } from '~/types'
import LessonCard from '~/components/Cards/LessonCard.vue'
import { removeTrailingSlashIfPossible } from '~/utils/utils'

const queryLessons = async () => {
  return (await queryContent<Lesson>('lecons')
    .sort({ slug: 1 })
    .only(['name', 'slug', 'page-title', 'page-title-search', 'categories'])
    .find())
    .map((data) => {
      const lesson: Lesson = {
        name: data.name as string,
        slug: data.slug as string,
        'page-title': data['page-title'] as string,
        'page-title-search': data['page-title-search'] as string,
        categories: data.categories as Category[]
      }
      return lesson
    })
}

const route = useRoute()
const { pending, data: lessons } = useLazyAsyncData(queryLessons)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
useWipBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/tree/master/latex${path}`)
</script>

<template>
  <div v-if="pending">
    <spinner />
  </div>
  <div v-else-if="lessons">
    <page-head title="Liste des leçons" />
    <h1>Liste des leçons</h1>
    <cards :items="lessons" :search-fields="['slug', 'name']">
      <template #default="slotProps">
        <lesson-card :lesson="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error="500" />
  </div>
</template>
