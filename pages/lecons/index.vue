<script setup lang="ts">
import type { Lesson } from '~/types'
import LessonCard from '~/components/Cards/LessonCard.vue'

const queryLessons = () => queryContent<Lesson>('latex', 'lecons')
  .sort({ slug: 1 })
  .without(['body'])
  .find()

const route = useRoute()
const { error, pending, data: lessons } = useLazyAsyncData<Lesson[]>(route.path, queryLessons)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
</script>

<template>
  <div v-if="pending">
    <spinner />
  </div>
  <div v-else-if="lessons">
    <page-head title="Liste des leçons" />
    <h1>Liste des leçons</h1>
    <cards
      input-id="lesson-search-field"
      :items="lessons"
      :search-fields="['slug', 'name']"
    >
      <template #default="slotProps">
        <lesson-card :lesson="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error="error" />
  </div>
</template>
