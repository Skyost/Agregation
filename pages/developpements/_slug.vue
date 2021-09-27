<template>
  <div v-if="$fetchState.pending">
    <spring-spinner />
  </div>
  <div v-else-if="development">
    <social-head :title="development['page-title']" :description="development['page-description']" />
    <math-document :document="development" />
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
      development: null
    }
  },
  async fetch () {
    if (Object.prototype.hasOwnProperty.call(this.$route.params, 'slug')) {
      this.development = await this.$content('developpements', this.$route.params.slug)
        .fetch()
    }
  },
  head () {
    return {
      title: this.development ? this.development['page-title'] : 'Affichage d\'un développement'
    }
  },
  mounted () {
    this.$parent.$emit('onpdfbanner', `/pdf${this.$route.path}.pdf`)
    this.$parent.$emit('oncaveatsbanner', `${GITHUB_PAGE}/edit/master/latex${this.$route.path}.tex`)
  }
}
</script>
