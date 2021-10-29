<template>
  <div>
    <h2 v-html="object.name" />
    <slot />
    <b-btn-group class="mt-2">
      <b-btn :to="`/${linkPrefix}/${object.slug}`" variant="black">
        <b-icon-box-arrow-in-right /> {{ btnCheck }}
      </b-btn>
      <b-btn :href="`/pdf/${linkPrefix}/${object.slug}.pdf`">
        <b-icon-file-text /> Télécharger le PDF
      </b-btn>
    </b-btn-group>
  </div>
</template>

<script>
import { BIconBoxArrowInRight, BIconFileText } from 'bootstrap-vue'

export default {
  name: 'LatexContentCard',
  components: { BIconBoxArrowInRight, BIconFileText },
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
