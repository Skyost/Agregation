<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { DevelopmentContent } from '~/types'

const route = useRoute()
const { error, pending, data: development } = useLazyAsyncData(
  route.path,
  () => queryContent<DevelopmentContent>('latex', 'developpements', route.params.slug.toString())
    .findOne(),
)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/content/latex${path}.tex`)

usePageHead({ title: 'Affichage d\'un développement' })
</script>

<template>
  <div>
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="development">
      <Title>{{ development['page-title'] }}</Title>
      <Meta
        name="description"
        :content="development['page-description']"
      />
      <Meta
        property="og:description"
        :content="development['page-description']"
      />
      <Meta
        name="twitter:description"
        :content="development['page-description']"
      />
      <main>
        <math-document :body="development.body" />
      </main>
    </div>
    <div v-else>
      <error-display :error="error" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'assets/highlighting';
</style>
