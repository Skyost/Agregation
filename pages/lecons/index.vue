<template>
  <div v-if="$fetchState.pending">
    <spring-spinner />
  </div>
  <div v-else-if="lessons">
    <social-head title="Liste des leçons" />
    <h1>Liste des leçons</h1>
    <cards :items="lessons" :search-fields="['slug', 'name']">
      <template #default="slotProps">
        <lesson-card :lesson="slotProps.item" />
      </template>
    </cards>
  </div>
  <div v-else>
    <error-display :error-code="404" />
  </div>
</template>

<script>
import LessonCard from '~/components/Cards/LessonCard'

export default {
  components: { LessonCard },
  data () {
    return {
      lessons: null
    }
  },
  async fetch () {
    this.lessons = await this.$content('lecons')
      .sortBy('slug')
      .fetch()
  },
  head () {
    return {
      title: 'Liste des leçons'
    }
  },
  mounted () {
    this.$parent.$emit('onpdfbanner', `/pdf${this.$route.path}.pdf`)
  }
}
</script>
