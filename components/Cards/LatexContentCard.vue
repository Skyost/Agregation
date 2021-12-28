<template>
  <div>
    <h2 v-html="object.name" />
    <slot />
    <ski-button-group class="mt-2">
      <ski-button :to="`/${linkPrefix}/${object.slug}`">
        <ski-icon icon="box-arrow-in-right" /> {{ btnCheck }}
      </ski-button>
      <ski-button :href="`/pdf/${linkPrefix}/${object.slug}.pdf`" variant="secondary">
        <ski-icon icon="file-text" /> Télécharger le PDF
      </ski-button>
    </ski-button-group>
  </div>
</template>

<script>
import { SkiButton, SkiButtonGroup, SkiIcon } from 'skimple-components'

export default {
  name: 'LatexContentCard',
  components: { SkiButtonGroup, SkiButton, SkiIcon },
  props: {
    btnCheck: {
      type: String,
      required: true
    },
    linkPrefix: {
      type: String,
      required: true
    },
    object: {
      type: Object,
      required: true
    }
  }
}
</script>
