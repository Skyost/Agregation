<template>
  <latex-content-card btn-check="Consulter le développement" link-prefix="developpements" :object="development">
    <p v-html="development.summary" />
  </latex-content-card>
</template>

<script>
import LatexContentCard from './LatexContentCard'

export default {
  name: 'DevelopmentCard',
  components: { LatexContentCard },
  props: {
    development: {
      type: Object,
      required: true
    }
  }
}
</script>
