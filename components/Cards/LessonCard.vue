<template>
  <div>
    <h2>
      <strong v-text="lesson.slug" /> {{ lesson.name }}
    </h2>
    <b-btn-group class="mt-2">
      <b-btn :to="`/lecons/${lesson.slug}`" variant="black">
        <b-icon-box-arrow-in-right /> Consulter le plan
      </b-btn>
      <b-btn :href="`/pdf/lecons/${lesson.slug}.pdf`">
        <b-icon-file-text /> Télécharger le PDF
      </b-btn>
    </b-btn-group>
  </div>
</template>

<script>
import { BIconBoxArrowInRight, BIconFileText } from 'bootstrap-vue'

export default {
  name: 'LessonCard',
  components: { BIconBoxArrowInRight, BIconFileText },
  props: {
    lesson: {
      type: Object,
      required: true
    }
  }
}
</script>
