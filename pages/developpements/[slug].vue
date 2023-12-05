<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { DevelopmentContent } from '~/types'

const route = useRoute()
const { error, pending, data: development } = useLazyAsyncData(
  route.path,
  () => queryContent<DevelopmentContent>('latex', 'developpements', route.params.slug.toString())
    .findOne()
)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/content/latex${path}.tex`)
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
      <math-document :body="development.body" />
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>
