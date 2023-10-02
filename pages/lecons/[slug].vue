<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { LessonContent } from '~/types'

const route = useRoute()
const { pending, data: lesson } = useLazyAsyncData(
  () => queryContent<LessonContent>('lecons', route.params.slug.toString())
    .findOne()
)

usePdfBanner(`/pdf${route.path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/latex${route.path}.tex`)
</script>

<template>
  <div>
    <page-head title="Affichage d'une leçon" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="lesson">
      <Title>Leçon {{ lesson.slug }} : {{ lesson['page-title'] }}</Title>
      <math-document :document="lesson" />
    </div>
    <div v-else>
      <error-display :error="404" />
    </div>
  </div>
</template>
