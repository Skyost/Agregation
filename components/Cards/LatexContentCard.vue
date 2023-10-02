<script setup lang="ts">
import { LatexContentObject } from '~/types'

defineProps<{
  btnCheck: string,
  linkPrefix: string,
  object: LatexContentObject
}>()
</script>

<template>
  <div>
    <h2 class="card-title" v-html="object.name" />
    <slot />
    <ski-button-group>
      <ski-button :to="`/${linkPrefix}/${object.slug}`">
        <ski-icon icon="box-arrow-in-right" /> {{ btnCheck }}
      </ski-button>
      <ski-button :href="`/pdf/${linkPrefix}/${object.slug}.pdf`" variant="secondary">
        <ski-icon icon="file-text" /> Télécharger le PDF
      </ski-button>
    </ski-button-group>
  </div>
</template>

<style lang="scss" scoped>
.card-title {
  border-bottom: none !important;
  margin-bottom: 18px !important;
}
</style>
