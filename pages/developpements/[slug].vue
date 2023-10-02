<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { DevelopmentContent } from '~/types'

const route = useRoute()
const { pending, data: development } = useLazyAsyncData(
  () => queryContent<DevelopmentContent>('developpements', route.params.slug.toString())
    .findOne()
)

usePdfBanner(`/pdf${route.path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/latex${route.path}.tex`)
</script>

<template>
  <div>
    <page-head title="Affichage d'un développement" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="development">
      <Title>{{ development['page-title'] }}</Title>
      <Meta name="description" :content="development['page-description']" />
      <Meta name="og:description" :content="development['page-description']" />
      <Meta name="twitter:description" :content="development['page-description']" />
      <math-document :document="development" />
    </div>
    <div v-else>
      <error-display :error="404" />
    </div>
  </div>
</template>
