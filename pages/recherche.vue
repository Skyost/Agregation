<template>
  <div>
    <social-head title="Recherche" />

    <h2>Recherche</h2>
    <p v-if="lessons.length > 0 || developments.length > 0">
      Voici les résultats pour votre recherche <q v-text="keywords" />.
    </p>
    <p v-else class="mb-0">
      Votre recherche n'a donné aucun résultat.
    </p>

    <div>
      <h3>Leçons</h3>
      <p v-if="lessons.length === 0" class="mb-0">
        Aucun plan de leçon trouvé pour cette recherche.
      </p>
      <cards v-if="lessons.length > 0" :items="lessons">
        <template #default="slotProps">
          <lesson-card :lesson="slotProps.item" />
        </template>
      </cards>
    </div>
    <div class="mt-4">
      <h3>Développements</h3>
      <p v-if="developments.length === 0" class="mb-0">
        Aucun développement trouvé pour cette recherche.
      </p>
      <cards v-if="developments.length > 0" :items="developments">
        <template #default="slotProps">
          <development-card :development="slotProps.item" />
        </template>
      </cards>
    </div>
  </div>
</template>

<script>
import LessonCard from '~/components/Cards/LessonCard'
import DevelopmentCard from '~/components/Cards/DevelopmentCard'
import SocialHead from '~/components/SocialHead'

export default {
  components: { LessonCard, DevelopmentCard, SocialHead },
  data () {
    return {
      keywords: '😉',
      lessons: [],
      developments: []
    }
  },
  head () {
    return {
      title: 'Recherche'
    }
  },
  async mounted () {
    if (Object.prototype.hasOwnProperty.call(this.$route.query, 'requete')) {
      const keywords = this.$route.query.requete
      this.keywords = keywords
      this.lessons = await this.$content('lecons')
        .search(keywords)
        .sortBy('slug')
        .fetch()
      this.developments = await this.$content('developpements')
        .search(keywords)
        .sortBy('name')
        .fetch()
    }
  }
}
</script>
