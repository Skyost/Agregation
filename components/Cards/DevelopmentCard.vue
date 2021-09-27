<template>
  <div>
    <h2 v-html="development.name" />
    <p v-html="development.summary" />
    <b-btn-group class="mt-2">
      <b-btn :to="`/developpements/${development.slug}`" variant="black">
        <b-icon-box-arrow-in-right /> Consulter le développement
      </b-btn>
      <b-btn :href="`/pdf/developpements/${development.slug}.pdf`">
        <b-icon-file-text /> Télécharger le PDF
      </b-btn>
    </b-btn-group>
  </div>
</template>

<script>
import { BIconBoxArrowInRight, BIconFileText } from 'bootstrap-vue'

export default {
  name: 'DevelopmentCard',
  components: { BIconBoxArrowInRight, BIconFileText },
  props: {
    development: {
      type: Object,
      required: true
    }
  }
}
</script>
