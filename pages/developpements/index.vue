<template>
  <div v-if="$fetchState.pending">
    <spring-spinner />
  </div>
  <div v-else-if="developments">
    <social-head title="Liste des développements" />
    <h1>Liste des développements</h1>
    <cards :items="developments" :search-fields="['name']">
      <template #default="slotProps">
        <development-card :development="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error-code="404" />
  </div>
</template>

<script>
import DevelopmentCard from '~/components/Cards/DevelopmentCard'

export default {
  components: { DevelopmentCard },
  data () {
    return {
      developments: null
    }
  },
  async fetch () {
    this.developments = await this.$content('developpements')
      .sortBy('page-title-search')
      .fetch()
  },
  head () {
    return {
      title: 'Liste des développements'
    }
  },
  mounted () {
    this.$parent.$emit('onpdfbanner', `/pdf${this.$route.path}.pdf`)
  }
}
</script>
