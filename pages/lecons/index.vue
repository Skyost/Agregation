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
import { GITHUB_PAGE } from '~/utils/site'

export default {
  components: { LessonCard },
  data () {
    return {
      githubPage: GITHUB_PAGE,
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
    this.$parent.$emit('onwipbanner', `${this.githubPage}/tree/master/latex${this.$route.path}`)
  }
}
</script>
