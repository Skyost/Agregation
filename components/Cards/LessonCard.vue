<template>
  <latex-content-card btn-check="Consulter le plan" link-prefix="lecons" :object="lesson" />
</template>

<script>
import LatexContentCard from './LatexContentCard'

export default {
  name: 'LessonCard',
  components: { LatexContentCard },
  props: {
    lesson: {
      type: Object,
      required: true
    }
  }
}
</script>
