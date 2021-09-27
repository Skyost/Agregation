<template>
  <div v-if="$fetchState.pending">
    <spring-spinner />
  </div>
  <div v-else-if="lesson">
    <social-head :title="`${lesson.slug} : ${lesson['page-title']}`" />
    <math-document :document="lesson" />
  </div>
  <div v-else>
    <error-display :error-code="404" />
  </div>
</template>

<script>
import { GITHUB_PAGE } from '~/utils/site'

export default {
  data () {
    return {
      lesson: null
    }
  },
  async fetch () {
    if (Object.prototype.hasOwnProperty.call(this.$route.params, 'slug')) {
      this.lesson = await this.$content('lecons', this.$route.params.slug)
        .fetch()
    }
  },
  head () {
    return {
      title: this.lesson ? `Leçon ${this.lesson.slug} : ${this.lesson['page-title']}` : 'Affichage d\'une leçon'
    }
  },
  mounted () {
    this.$parent.$emit('onpdfbanner', `/pdf${this.$route.path}.pdf`)
    this.$parent.$emit('oncaveatsbanner', `${GITHUB_PAGE}/edit/master/latex${this.$route.path}.tex`)
  }
}
</script>
