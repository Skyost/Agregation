<script setup lang="ts">
import { siteMeta } from '~/site/meta'
import type { SheetContent } from '~/types'

const route = useRoute()
const { error, pending, data: sheet } = useLazyAsyncData(
  route.path,
  () => queryContent<SheetContent>('latex', 'fiches', route.params.slug.toString())
    .findOne()
)

const path = removeTrailingSlashIfPossible(route.path)
usePdfBanner(`/pdf${path}.pdf`)
useCaveatsBanner(`https://github.com/${siteMeta.github.username}/${siteMeta.github.repository}/edit/master/content/latex${path}.tex`)
</script>

<template>
  <div>
    <page-head title="Affichage d'une fiche" />
    <div v-if="pending">
      <spinner />
    </div>
    <div v-else-if="sheet">
      <Title>{{ sheet['page-title'] }}</Title>
      <Meta name="description" :content="sheet['page-description']" />
      <Meta property="og:description" :content="sheet['page-description']" />
      <Meta name="twitter:description" :content="sheet['page-description']" />
      <main>
        <math-document :body="sheet.body" />
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
