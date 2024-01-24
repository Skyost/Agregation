<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { LessonContent } from '~/types'

const route = useRoute()
const { error, pending, data: lesson } = useLazyAsyncData(
  route.path,
  () => queryContent<LessonContent>('latex', 'lecons', route.params.slug.toString())
    .findOne()
)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/content/latex${path}.tex`)
</script>

<template>
  <div>
    <page-head title="Affichage d'une leçon" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="lesson">
      <Title>Leçon {{ lesson.slug }} : {{ lesson['page-title'] }}</Title>
      <Meta property="article:modified_time" :content="lesson['page-last-modification-time']" />
      <math-document :body="lesson.body" />
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
